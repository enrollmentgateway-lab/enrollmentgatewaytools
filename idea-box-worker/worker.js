const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };
const ALLOWED_STATUSES = ['new', 'planned', 'in-progress', 'done', 'declined'];

function corsHeaders(env, request) {
  const origin = request.headers.get('Origin');
  const headers = {
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-Admin-Key',
    'Access-Control-Max-Age': '86400',
  };
  if (origin && origin === env.ALLOWED_ORIGIN) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Vary'] = 'Origin';
  }
  return headers;
}

function json(data, status, extraHeaders) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { ...JSON_HEADERS, ...(extraHeaders || {}) },
  });
}

function isAdmin(request, env) {
  const key = request.headers.get('X-Admin-Key');
  return Boolean(env.ADMIN_KEY) && key === env.ADMIN_KEY;
}

function isValidUrl(value) {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const IDEA_COLUMNS = 'id, title, description, url, submitter, status, votes, created_at';

export default {
  async fetch(request, env) {
    const cors = corsHeaders(env, request);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean);

    try {
      if (parts[0] !== 'api' || parts[1] !== 'ideas') {
        return json({ error: 'not found' }, 404, cors);
      }

      if (parts.length === 2 && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          `SELECT ${IDEA_COLUMNS} FROM ideas ORDER BY votes DESC, created_at DESC`
        ).all();
        return json({ ideas: results }, 200, cors);
      }

      if (parts.length === 2 && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const title = String(body.title || '').trim().slice(0, 200);
        const description = String(body.description || '').trim().slice(0, 2000);
        const submitter = String(body.submitter || '').trim().slice(0, 120);
        const ideaUrl = String(body.url || '').trim().slice(0, 500);
        if (!title) return json({ error: 'title is required' }, 400, cors);
        if (!isValidUrl(ideaUrl)) return json({ error: 'url must be a valid http(s) link' }, 400, cors);

        const result = await env.DB.prepare(
          `INSERT INTO ideas (title, description, url, submitter, status, votes, created_at)
           VALUES (?, ?, ?, ?, 'new', 0, datetime('now'))
           RETURNING ${IDEA_COLUMNS}`
        ).bind(title, description, ideaUrl, submitter).first();
        return json({ idea: result }, 201, cors);
      }

      const id = Number(parts[2]);
      if (parts.length >= 3 && (!Number.isInteger(id) || id <= 0)) {
        return json({ error: 'invalid id' }, 400, cors);
      }

      if (parts.length === 4 && parts[3] === 'vote' && request.method === 'POST') {
        const result = await env.DB.prepare(
          'UPDATE ideas SET votes = votes + 1 WHERE id = ? RETURNING id, votes'
        ).bind(id).first();
        if (!result) return json({ error: 'idea not found' }, 404, cors);
        return json(result, 200, cors);
      }

      if (parts.length === 3 && request.method === 'PATCH') {
        if (!isAdmin(request, env)) return json({ error: 'unauthorized' }, 401, cors);
        const body = await request.json().catch(() => ({}));
        const status = String(body.status || '');
        if (!ALLOWED_STATUSES.includes(status)) return json({ error: 'invalid status' }, 400, cors);
        const result = await env.DB.prepare(
          'UPDATE ideas SET status = ? WHERE id = ? RETURNING id, status'
        ).bind(status, id).first();
        if (!result) return json({ error: 'idea not found' }, 404, cors);
        return json(result, 200, cors);
      }

      if (parts.length === 3 && request.method === 'DELETE') {
        if (!isAdmin(request, env)) return json({ error: 'unauthorized' }, 401, cors);
        await env.DB.prepare('DELETE FROM ideas WHERE id = ?').bind(id).run();
        return json({ ok: true }, 200, cors);
      }

      return json({ error: 'not found' }, 404, cors);
    } catch (err) {
      return json({ error: 'server error', message: String((err && err.message) || err) }, 500, cors);
    }
  },
};
