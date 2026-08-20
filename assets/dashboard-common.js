(function () {
  'use strict';

  const PARENT_ORIGIN = 'https://enroll.gs.edu';

  const periods = Object.freeze({
    total: Object.freeze({ label: 'Total (All Time)', term: null, year: null }),
    FA26: Object.freeze({ label: 'FA26 — Fall 2026', term: 'Fall', year: '2026-2027' }),
    SP27: Object.freeze({ label: 'SP27 — Spring 2027', term: 'Spring', year: '2026-2027' }),
    FA27: Object.freeze({ label: 'FA27 — Fall 2027', term: 'Fall', year: '2027-2028' })
  });

  function periodKey(term, year) {
    return Object.keys(periods).find(function (key) {
      return periods[key].term === (term || null) && periods[key].year === (year || null);
    }) || 'total';
  }

  function populatePeriodSelect(select, term, year) {
    if (!select) return;
    select.replaceChildren();
    Object.keys(periods).forEach(function (key) {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = periods[key].label;
      select.appendChild(option);
    });
    select.value = periodKey(term, year);
  }

  function periodNavigation(key) {
    const period = periods[key] || periods.total;
    if (!period.term) return { set: {}, remove: ['term', 'year'] };
    return { set: { term: period.term, year: period.year }, remove: [] };
  }

  function createBridge(dashboard, onData) {
    let resizeFrame = 0;

    function post(type, details) {
      if (window.parent === window) return;
      window.parent.postMessage(Object.assign({ type: type, dashboard: dashboard }, details || {}), PARENT_ORIGIN);
    }

    function resize() {
      if (resizeFrame) return;
      resizeFrame = window.requestAnimationFrame(function () {
        resizeFrame = 0;
        const height = Math.ceil(document.documentElement.scrollHeight);
        post('enrollment-dashboard-resize', { height: height });
      });
    }

    window.addEventListener('message', function (event) {
      if (event.origin !== PARENT_ORIGIN || event.source !== window.parent || !event.data) return;
      if (event.data.type !== 'enrollment-dashboard-data' || event.data.dashboard !== dashboard) return;
      onData(event.data.payload || {});
      resize();
    });

    window.addEventListener('load', function () {
      post('enrollment-dashboard-ready');
      resize();
    });

    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(document.documentElement);

    return Object.freeze({
      navigate: function (set, remove) {
        post('enrollment-dashboard-navigate', { set: set || {}, remove: remove || [] });
      },
      openRecord: function (url) {
        if (url) post('enrollment-dashboard-open-record', { url: String(url) });
      },
      resize: resize
    });
  }

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function text(value, fallback) {
    return value == null || value === '' ? (fallback == null ? '—' : fallback) : String(value);
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = text(value, '0');
  }

  function showApp() {
    const loading = document.getElementById('loading');
    const app = document.getElementById('app');
    if (loading) loading.hidden = true;
    if (app) app.hidden = false;
  }

  function emptyState(message) {
    const element = document.createElement('div');
    element.className = 'empty-state';
    const icon = document.createElement('div');
    icon.className = 'empty-state-icon';
    icon.textContent = '—';
    const copy = document.createElement('div');
    copy.textContent = message;
    element.append(icon, copy);
    return element;
  }

  window.AcademicPeriods = Object.freeze({
    values: periods,
    keyFrom: periodKey,
    populate: populatePeriodSelect,
    navigation: periodNavigation
  });
  window.DashboardBridge = Object.freeze({ create: createBridge });
  window.DashboardUI = Object.freeze({
    number: number,
    text: text,
    setText: setText,
    showApp: showApp,
    emptyState: emptyState
  });
}());
