// Disable right-click and keyboard shortcuts
document.addEventListener('contextmenu', (e) => e.preventDefault());// Disable right-click
document.addEventListener('keydown', (e) => {
  if (e.key === 'F12') {e.preventDefault();}// Disable F12
  if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {e.preventDefault();}
  if (e.ctrlKey && e.key === 'u') {e.preventDefault();} // Disable Ctrl+U (View Source)
  if (e.ctrlKey && e.key === 's') {e.preventDefault();}// Disable Ctrl+S (Save Page)
});



/**
 * tracker.js  —  Ashish.dev Portfolio Analytics
 * ─────────────────────────────────────────────
 * Handles two things in one file:
 *   1. Page Visit  → creates Website_Visit__c in Salesforce
 *   2. Time on Page → creates Page_Time__c in Salesforce
 *
 * Include on every HTML page:
 *   <script src="tracker.js" defer></script>
 *
 * No configuration needed per-page — it auto-detects everything.
 */

(function () {
  'use strict';

  // ── CONFIG — change only these if anything moves ─────────────
  const SF_ENDPOINT    = 'https://ashishkurzekar-dev-ed.develop.my.salesforce-sites.com/webhook/services/apexrest/visittrack';
  const IDLE_MS        = 30 * 1000;   // pause time counter after 30s of no activity
  const MIN_VISIT_SECS = 3;           // don't send time record if active < 3s (bot/accidental)
  const HEARTBEAT_MS   = 5 * 1000;    // save time progress to sessionStorage every 5s

  // ═══════════════════════════════════════════════════════════════
  //  SHARED STATE
  // ═══════════════════════════════════════════════════════════════

  // Session ID — persists across pages within one browser session
  // Both visit and time records share this so they can be linked in SF
  let sessionId = sessionStorage.getItem('ak_session_id');
  if (!sessionId) {
    sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    sessionStorage.setItem('ak_session_id', sessionId);
  }

  // Returning visitor — persists across sessions via localStorage
  const isReturning = !!localStorage.getItem('ak_ret');
  localStorage.setItem('ak_ret', '1');

  // Stable per-page key based on pathname  e.g. "ak_v_index.html" or "ak_v_blogs.html"
  const pageName   = window.location.pathname.replace(/^\//, '') || 'index';
  const visitKey   = 'ak_v_' + pageName;   // guards one visit record per page per session
  const timeKey    = 'ak_t_' + pageName;   // stores time progress for crash recovery

  // ═══════════════════════════════════════════════════════════════
  //  UTILITIES
  // ═══════════════════════════════════════════════════════════════

  function getUTM(param) {
    try { return new URLSearchParams(window.location.search).get(param) || ''; }
    catch (e) { return ''; }
  }

  function parseUA(ua) {
    ua = ua || '';
    let deviceType = 'Desktop';
    if      (/tablet|ipad|playbook|silk/i.test(ua))                               deviceType = 'Tablet';
    else if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) deviceType = 'Mobile';

    let browser = 'Unknown';
    if      (/Edg\//i.test(ua))        browser = 'Edge';
    else if (/OPR\//i.test(ua))        browser = 'Opera';
    else if (/Chrome\//i.test(ua))     browser = 'Chrome';
    else if (/Safari\//i.test(ua))     browser = 'Safari';
    else if (/Firefox\//i.test(ua))    browser = 'Firefox';
    else if (/MSIE|Trident/i.test(ua)) browser = 'IE';
    const vm = ua.match(/(Edg|OPR|Chrome|Safari|Firefox|MSIE|rv)[\/: ]([0-9.]+)/);
    if (vm && vm[2]) browser += ' ' + vm[2].split('.')[0];

    let os = 'Unknown';
    if      (/Windows NT 10/i.test(ua))       os = 'Windows 10/11';
    else if (/Windows NT 6.3/i.test(ua))      os = 'Windows 8.1';
    else if (/Windows NT 6.1/i.test(ua))      os = 'Windows 7';
    else if (/Windows/i.test(ua))             os = 'Windows';
    else if (/iPhone OS ([0-9_]+)/i.test(ua)) os = 'iOS '     + ua.match(/iPhone OS ([0-9_]+)/)[1].replace(/_/g, '.');
    else if (/iPad.*OS ([0-9_]+)/i.test(ua))  os = 'iPadOS '  + ua.match(/iPad.*OS ([0-9_]+)/)[1].replace(/_/g, '.');
    else if (/Android ([0-9.]+)/i.test(ua))   os = 'Android ' + ua.match(/Android ([0-9.]+)/)[1];
    else if (/Mac OS X ([0-9_]+)/i.test(ua))  os = 'macOS '   + ua.match(/Mac OS X ([0-9_]+)/)[1].replace(/_/g, '.');
    else if (/Linux/i.test(ua))               os = 'Linux';
    return { deviceType, browser, os };
  }

  function getConnection() {
    try {
      const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      return c ? (c.effectiveType || c.type || '') : '';
    } catch (e) { return ''; }
  }

  // Fire-and-forget POST — text/plain blob avoids CORS preflight on SF guest sites
  function post(url, payload) {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const sent = navigator.sendBeacon(url, new Blob([body], { type: 'text/plain' }));
      if (sent) return;
    }
    fetch(url, {
      method    : 'POST',
      headers   : { 'Content-Type': 'application/json' },
      body      : body,
      keepalive : true,
      mode      : 'no-cors'
    }).catch(function () {});
  }

  // ═══════════════════════════════════════════════════════════════
  //  PART 1 — PAGE VISIT TRACKING
  //  Fires once per page per browser session (~800ms after load)
  // ═══════════════════════════════════════════════════════════════

  function trackVisit() {
    // Guard: only fire once per page per session
    if (sessionStorage.getItem(visitKey)) return;
    sessionStorage.setItem(visitKey, '1');

    const ua     = navigator.userAgent || '';
    const parsed = parseUA(ua);

    post(SF_ENDPOINT, {
      trackingType     : 'page_visit',
      sessionId        : sessionId,

      // UTM
      utmSource        : getUTM('utm_source'),
      utmMedium        : getUTM('utm_medium'),
      utmCampaign      : getUTM('utm_campaign'),
      utmTerm          : getUTM('utm_term'),
      utmContent       : getUTM('utm_content'),

      // Page
      pageUrl          : window.location.href,
      pageTitle        : document.title,
      referrer         : document.referrer,

      // Device
      userAgent        : ua,
      browser          : parsed.browser,
      os               : parsed.os,
      deviceType       : parsed.deviceType,
      screenResolution : screen.width + 'x' + screen.height,
      viewportSize     : window.innerWidth + 'x' + window.innerHeight,

      // Locale
      language         : navigator.language || '',
      timezone         : (function() {
                           try { return Intl.DateTimeFormat().resolvedOptions().timeZone; }
                           catch(e) { return ''; }
                         })(),
      connectionType   : getConnection(),

      // Meta
      visitTimestamp   : new Date().toISOString(),
      isReturning      : isReturning
    });
  }

  // ═══════════════════════════════════════════════════════════════
  //  PART 2 — TIME ON PAGE TRACKING
  //  Measures active (engaged) time, sends on page exit
  // ═══════════════════════════════════════════════════════════════

  let activeMs     = 0;
  let segStart     = null;
  let isIdle       = false;
  let idleTimer    = null;
  let heartbeat    = null;
  let timeSent     = false;
  let maxScroll    = 0;

  // Restore any saved progress (protects against crash / back-nav)
  try {
    const saved = sessionStorage.getItem(timeKey);
    if (saved) activeMs = parseInt(saved, 10) || 0;
  } catch(e) {}

  function startSeg() {
    if (segStart !== null) return;
    segStart = performance.now();
    isIdle   = false;
  }

  function pauseSeg() {
    if (segStart === null) return;
    activeMs += performance.now() - segStart;
    segStart  = null;
    isIdle    = true;
  }

  function resetIdle() {
    clearTimeout(idleTimer);
    if (isIdle) startSeg();
    idleTimer = setTimeout(pauseSeg, IDLE_MS);
  }

  function engagementLabel(secs, scroll) {
    if (secs >= 120 && scroll >= 75) return 'Deep Read';
    if (secs >= 60  && scroll >= 50) return 'Engaged';
    if (secs >= 20)                  return 'Skimmed';
    return 'Glanced';
  }

  function sendTime() {
    if (timeSent) return;
    timeSent = true;

    clearInterval(heartbeat);
    clearTimeout(idleTimer);

    // Flush current segment
    if (segStart !== null) {
      activeMs += performance.now() - segStart;
      segStart  = null;
    }

    const activeSecs = Math.round(activeMs / 1000);
    sessionStorage.removeItem(timeKey);

    if (activeSecs < MIN_VISIT_SECS) return; // too short, don't send

    post(SF_ENDPOINT + '?type=time', {
      trackingType   : 'time_on_page',
      sessionId      : sessionId,
      pageUrl        : window.location.href,
      pagePath       : window.location.pathname,
      pageTitle      : document.title,
      activeSeconds  : activeSecs,
      scrollDepthPct : maxScroll,
      visitTimestamp : new Date().toISOString(),
      engagementLabel: engagementLabel(activeSecs, maxScroll)
    });
  }

  // Activity events that prove user engagement
  ['mousemove','mousedown','keydown','scroll','touchstart','click','wheel']
    .forEach(function(e) {
      document.addEventListener(e, resetIdle, { passive: true });
    });

  // Track max scroll depth
  document.addEventListener('scroll', function() {
    try {
      const scrolled = window.scrollY || window.pageYOffset;
      const total    = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight
      ) - window.innerHeight;
      const pct = total > 0 ? Math.min(100, Math.round((scrolled / total) * 100)) : 100;
      if (pct > maxScroll) maxScroll = pct;
    } catch(e) {}
  }, { passive: true });

  // Pause/resume on tab switch
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      pauseSeg();
      clearTimeout(idleTimer);
      sendTime(); // send immediately when tab is hidden — user may not come back
    } else {
      timeSent = false; // allow re-send if they come back (new segment)
      startSeg();
      resetIdle();
    }
  });

  // Heartbeat — save progress every 5s in case of crash
  heartbeat = setInterval(function() {
    const snapshot = activeMs + (segStart !== null ? performance.now() - segStart : 0);
    try { sessionStorage.setItem(timeKey, Math.round(snapshot).toString()); } catch(e) {}
  }, HEARTBEAT_MS);

  // Send on page exit
  window.addEventListener('pagehide',     sendTime);
  window.addEventListener('beforeunload', sendTime);

  // ═══════════════════════════════════════════════════════════════
  //  INIT — wait for DOM then fire visit tracker, start time tracker
  // ═══════════════════════════════════════════════════════════════
  function init() {
    setTimeout(trackVisit, 800); // slight delay — doesn't compete with page render
    startSeg();
    resetIdle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();