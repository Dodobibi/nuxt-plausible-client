import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import { plausible } from '#imports';

const MIDDLE_MOUSE_BUTTON = 1;

export default defineNuxtPlugin(() => {
  const handler = (event: MouseEvent) => {
    if (event.type === 'auxclick' && event.button !== MIDDLE_MOUSE_BUTTON) return;
    // console.log('click event', event);
    const target = (event.target as HTMLElement).closest('a'); // Remonte l'arbre DOM pour trouver l'élément <a> cliqué
    const config = useRuntimeConfig().public.plausible;
    if (target && target.href) {
      const url = new URL(target.href);
      // check if it's an outbound link first
      if (url.host !== location.host) return config.trackOutboundLinks && plausibleOutboundLink({ url: url.href });

      // check if it's a file download
      function isDownloadToTrack(href: string) {
        if (!href) return false;
        const fileType = href.split('.').pop();
        return fileType && config.trackFileDownloads.split(',').includes(fileType);
      }
      if (target.hasAttribute('download') || isDownloadToTrack(url.href))
        return config.trackFileDownloads && plausibleFileDownload({ url: url.href });
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
