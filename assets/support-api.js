(function () {
  'use strict';

  const config = window.SupportConfig || {};

  function configured(value) {
    return value && !String(value).includes('YOUR_');
  }

  function requireConfig() {
    if (!configured(config.supabaseUrl) || !configured(config.publishableKey)) {
      throw new Error('The support portal has not been connected to Supabase yet.');
    }
  }

  function url(path) {
    requireConfig();
    return String(config.supabaseUrl).replace(/\/$/, '') + '/functions/v1/support-api' + path;
  }

  async function responseJson(response) {
    const text = await response.text();
    if (!text) return {};
    try { return JSON.parse(text); }
    catch { return { error: text }; }
  }

  async function request(path, options) {
    const settings = options || {};
    const headers = Object.assign({
      apikey: config.publishableKey,
      Accept: 'application/json'
    }, settings.headers || {});
    if (settings.body != null) headers['Content-Type'] = 'application/json';
    if (settings.token) headers.Authorization = 'Bearer ' + settings.token;
    if (settings.apiKey) headers['X-API-Key'] = settings.apiKey;

    const response = await fetch(url(path), {
      method: settings.method || 'GET',
      headers: headers,
      body: settings.body == null ? undefined : JSON.stringify(settings.body)
    });
    const data = await responseJson(response);
    if (!response.ok) {
      const error = new Error(data.error || data.message || 'The support service returned an error.');
      error.status = response.status;
      error.details = data;
      throw error;
    }
    return data;
  }

  async function signIn(email, password) {
    requireConfig();
    const response = await fetch(String(config.supabaseUrl).replace(/\/$/, '') + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { apikey: config.publishableKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    });
    const data = await responseJson(response);
    if (!response.ok) throw new Error(data.error_description || data.msg || data.message || 'Sign-in failed.');
    return data;
  }

  async function refreshSession(refreshToken) {
    requireConfig();
    const response = await fetch(String(config.supabaseUrl).replace(/\/$/, '') + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: { apikey: config.publishableKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    const data = await responseJson(response);
    if (!response.ok) throw new Error(data.error_description || data.msg || data.message || 'Your session could not be refreshed.');
    return data;
  }

  window.SupportClient = Object.freeze({
    config: config,
    configured: configured,
    request: request,
    signIn: signIn,
    refreshSession: refreshSession
  });
}());
