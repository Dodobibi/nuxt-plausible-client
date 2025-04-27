import { defineNuxtPlugin } from '#app';
import { plausible } from '#imports';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:error', (error) => {
    if (error?.statusCode === 404) {
      plausible404({ path: error.data.path });
    }
  });

  const plausible404 = (payload: { path: string }) => {
    return plausible('404', {
      p: { path: payload.path },
    });
  };

  return {
    provide: {
      plausible404,
    },
  };
});
