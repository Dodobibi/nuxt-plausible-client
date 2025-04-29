import { defineNuxtPlugin, useRouter } from '#app';
import { plausible } from '#imports';

export default defineNuxtPlugin((_nuxtApp) => {
  let currentEngagementURL: string;
  let currentEngagementMaxScrollDepth = -1;
  const currentDocumentHeight = getDocumentHeight();
  const maxScrollDepthPx = getCurrentScrollDepthPx();
  // Timestamp indicating when this particular page last became visible.
  // Reset during pageviews, set to null when page is closed.
  let runningEngagementStart: number | null = null;
  // When page is hidden, this 'engaged' time is saved to this variable
  let currentEngagementTime = 0;

  function getEngagementTime() {
    if (runningEngagementStart) {
      return currentEngagementTime + (Date.now() - runningEngagementStart);
    } else {
      return currentEngagementTime;
    }
  }

  function getCurrentScrollDepthPx() {
    const body = document.body || {};
    const el = document.documentElement || {};
    const viewportHeight = window.innerHeight || el.clientHeight || 0;
    const scrollTop = window.scrollY || el.scrollTop || body.scrollTop || 0;

    return currentDocumentHeight <= viewportHeight ? currentDocumentHeight : scrollTop + viewportHeight;
  }

  function getDocumentHeight() {
    const body = document.body || {};
    const el = document.documentElement || {};
    return Math.max(
      body.scrollHeight || 0,
      body.offsetHeight || 0,
      body.clientHeight || 0,
      el.scrollHeight || 0,
      el.offsetHeight || 0,
      el.clientHeight || 0,
    );
  }

  function onVisibilityChange() {
    // If the page is visible and has focus, start the engagement timer
    if (document.visibilityState === 'visible' && document.hasFocus() && runningEngagementStart === null) {
      runningEngagementStart = Date.now();
    } else if (document.visibilityState === 'hidden' || !document.hasFocus()) {
      // Tab went back to background or lost focus. Save the engaged time so far
      currentEngagementTime = getEngagementTime();
      runningEngagementStart = null;
      trackEngagement();
    }
  }

  useRouter().beforeEach(() => {
    trackEngagement();
  });
  useRouter().afterEach((to, from, f) => {
    if (!f) {
      currentEngagementTime = 0;
      runningEngagementStart = Date.now();
      currentEngagementMaxScrollDepth = -1;
      currentEngagementURL = `${window.location.origin}${to.fullPath}`;
    }
  });

  window.addEventListener('visibilitychange', onVisibilityChange);
  addEventListener('beforeunload', trackEngagement);
  window.addEventListener('blur', onVisibilityChange);
  window.addEventListener('focus', onVisibilityChange);

  function trackEngagement() {
    const engagementTime = getEngagementTime();

    /*
    We send engagements if there's new relevant engagement information to share:
    - If the user has scrolled more than the previously sent max scroll depth.
    - If the user has been engaged for more than 3 seconds since the last engagement event.

    The first engagement event is always sent due to containing at least the initial scroll depth.

    Also, we don't send engagements if the current pageview is ignored (onIgnoredEvent)
    */
    if (currentEngagementURL && (currentEngagementMaxScrollDepth < maxScrollDepthPx || engagementTime >= 3000)) {
      currentEngagementMaxScrollDepth = maxScrollDepthPx;

      plausibleEngagement({
        url: currentEngagementURL,
        engagementTime,
        scrollDepth: Math.round((maxScrollDepthPx / currentDocumentHeight) * 100),
      });

      // Reset current engagement time metrics. They will restart upon when page becomes visible or the next SPA pageview
      runningEngagementStart = null;
      currentEngagementTime = 0;
    }
  }

  const plausibleEngagement = (payload: { url: string; engagementTime: number; scrollDepth: number }) => {
    return plausible('engagement', {
      u: currentEngagementURL,
      sd: payload.scrollDepth,
      e: payload.engagementTime,
    });
  };

  return {
    provide: {
      plausibleEngagement,
    },
  };
});
