import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import { plausible } from '#imports';

const MIDDLE_MOUSE_BUTTON = 1;

export default defineNuxtPlugin(() => {
  const handler = (event: MouseEvent) => {
    if (event.type === 'auxclick' && event.button !== MIDDLE_MOUSE_BUTTON) return;
    // console.log('click event', event);
    const target = (event.target as HTMLElement).closest('a'); // Remonte l'arbre DOM pour trouver l'élément <a> cliqué
    const config = useRuntimeConfig().public.plausible;
    if (target) {
      const href = target.href;
      if (href) {
        // check if it's an outbound link first
        if (new URL(target.href).host !== location.host)
          return config.trackOutboundLinks && plausibleOutboundLink({ url: target.href });

        // check if it's a file download
        function isDownloadToTrack(url: string) {
          if (!url) return false;
          const fileType = url.split('.').pop();
          return fileType && config.trackFileDownloads.split(',').includes(fileType);
        }
        if (target.hasAttribute('download') || isDownloadToTrack(href))
          return config.trackFileDownloads && plausibleFileDownload({ url: href });
      }
    }
  };

  document.addEventListener('click', handler);
  document.addEventListener('auxclick', handler);

  const plausibleFileDownload = (payload: { url: string }) => {
    return plausible('File Download', { p: { url: payload.url } });
  };

  const plausibleOutboundLink = (payload: { url: string }) => {
    return plausible('Outbound Link: Click', { p: { url: payload.url } });
  };

  return {
    provide: {
      plausibleOutboundLink,
      plausibleFileDownload,
    },
  };
});
