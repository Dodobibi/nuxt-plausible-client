export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },

  compatibilityDate: '2025-04-25',

  plausible: {
    // domain: 'PUT_YOUR_DOMAIN_HERE',
    proxyEndpoint: '/api/event',
    trackPageviews: true,
    trackEngagement: true,
    track404: true,
    trackOutboundLinks: true,
    trackFileDownloads: '*',
    debug: true,
  },
});
