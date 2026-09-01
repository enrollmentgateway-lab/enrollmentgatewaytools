(function () {
  'use strict';

  const PRODUCTION_HOST = 'enrollmentgateway-lab.github.io';
  const SITE_TOKEN = '41948a5bca5f4a97b32961ff03ce053f';

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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadBeacon, { once:true });
  else loadBeacon();
}());
