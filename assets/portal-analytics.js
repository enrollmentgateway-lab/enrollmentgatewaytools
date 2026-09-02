(function () {
  'use strict';

  const PRODUCTION_HOST = 'enrollmentgateway-lab.github.io';
  const SITE_TOKEN = '41948a5bca5f4a97b32961ff03ce053f';
  const AGGREGATE_ENDPOINT = 'https://slate-query-tool.queryomatic.workers.dev/api/analytics/event';

  if (window.location.hostname !== PRODUCTION_HOST || !SITE_TOKEN) return;

  function loadBeacon() {
    if (document.querySelector('script[data-enrollment-portal-analytics]')) return;
    const beacon = document.createElement('script');
    beacon.defer = true;
    beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    beacon.referrerPolicy = 'no-referrer';
    beacon.setAttribute('data-enrollment-portal-analytics', '');
    beacon.setAttribute('data-cf-beacon', JSON.stringify({ token: SITE_TOKEN }));
    document.head.appendChild(beacon);
  }

  function recordAggregateVisit() {
    if (window.location.pathname.includes('/analytics/')) return;

    let sessionId = sessionStorage.getItem('enrollment-analytics-session');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('enrollment-analytics-session', sessionId);
    }

    fetch(AGGREGATE_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify({
        path: window.location.pathname,
        session: sessionId
      }),
      keepalive: true
    }).catch(function () {
      // Analytics must never interfere with a portal page.
    });
  }

  function startAnalytics() {
    loadBeacon();
    recordAggregateVisit();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startAnalytics, { once:true });
  else startAnalytics();
}());
