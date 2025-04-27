import { defineNuxtPlugin, useRouter } from '#app';
import { plausible } from '#imports';

export default defineNuxtPlugin((_nuxtApp) => {
  let referrer: string | null | undefined = document.referrer || null;

  useRouter().afterEach((to, from, f) => {
    if (!f) {
      plausiblePageview({ url: to.path, referrer: referrer === undefined ? from.fullPath : referrer });
      referrer = undefined;
    }
  });

  const plausiblePageview = (payload: { url: string; referrer: string | null }) => {
    return plausible('pageview', {
      u: payload.url,
      r: payload.referrer,
    });
  };

  return {
    provide: {
      plausiblePageview,
    },
  };
});
