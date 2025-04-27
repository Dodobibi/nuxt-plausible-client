import { createError, defineEventHandler, proxyRequest, useRuntimeConfig, getRequestIP } from '#imports';

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event).plausible;
  try {
    return proxyRequest(event, config.apiEndpoint, {
      headers: {
        'X-Forwarded-For': getRequestIP(event, { xForwardedFor: true }),
      },
    });
  } catch {
    throw createError({
      statusCode: 502,
      message: 'Failed to proxy request to Plausible API',
    });
  }
});
