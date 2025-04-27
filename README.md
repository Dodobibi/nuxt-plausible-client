# Nuxt Plausible Client

Native integration of [Plausible Analytics](https://plausible.io/sites) for [Nuxt](https://nuxt.com).

## Why This Module

[Plausible](https://plausible.io) @v3 has updated their tracking script to be more modular and flexible. Scroll depth, engagement time, and time on page metrics are now tracked automatically by the tracker itself.

This module provides a native tracker for [Nuxt](https://nuxt.com) that:

- Uses events emitted by the Nuxt router to track page views, engagement time, and scroll depth automatically
- Tracks 404 pages and outbound link clicks
- Provides composables for tracking custom events
- Is lightweight and easy to use with no external dependencies and minimal configuration required

## Features

- Optional API proxy
- Auto pageview (and engagement) tracking
- Auto outbound link tracking
- Auto file download tracking
- Auto time on page tracking
- Auto scroll depth tracking
- Auto 404 page tracking
- Custom props and revenue tracking (with hook)
- Custom event tracking by composable

## Installation

```bash
# npm
npm install nuxt-plausible-client

# yarn
yarn add nuxt-plausible-client

# pnpm
pnpm add nuxt-plausible-client
```

Add the module to your `nuxt.config.ts`:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-plausible-client'],
  // optional configuration
  plausible: {
    ... // module options
  },
});
```

## Module Options

| Option               | Type      | Default                          | Description                                                         |
| -------------------- | --------- | -------------------------------- | ------------------------------------------------------------------- |
| `domain`             | `string`  | `window.location.hostname`       | The domain to track                                                 |
| `apiEndpoint`        | `string`  | `https://plausible.io/api/event` | Plausible API endpoint                                              |
| `proxyEndpoint`      | `string`  | `undefined`                      | Optional proxy endpoint (setting it for activation, ex: /api/event) |
| `trackPageviews`     | `boolean` | `true`                           | Track page views automatically                                      |
| `trackEngagement`    | `boolean` | `true`                           | Track user engagement                                               |
| `trackOutboundLinks` | `boolean` | `false`                          | Track clicks on external links                                      |
| `trackFileDownloads` | `boolean` | `false`                          | Track file downloads                                                |
| `track404`           | `boolean` | `false`                          | Track 404 error pages                                               |
| `debug`              | `boolean` | `false`                          | Enable debug mode                                                   |

## Tracking Custom Events

### Using the `plausible` Utils

```ts
// Tracks the `custom` event
plausible('custom');

// Tracks the `custom` event with props...
plausible('custom', { p: { key: 'value' } });
```

### Adding Custom Properties or Revenue Dynamically

Create a client plugin to subscribe to the `plausible:track` hook. You can update the Plausible payload directly or use the provided helper functions:

```ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('plausible:track', async ({ eventName, payload, addProp, addRevenue }) => {
    // Add user information to all events
    if (eventName === 'pageview') {
      addProp('userType', 'premium');
    }

    // Track revenue for purchase events
    if (eventName === 'purchase') {
      addRevenue({ amount: 99.99, currency: 'USD' });
    }

    // Or modify the payload directly
    payload.p = { ...payload.p, customProp: 'value' };
    payload.$ = { amount: 99.99, currency: 'USD' };
  });
});
```

## Examples

### Basic Setup

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-plausible'],
  plausible: {
    domain: 'yourdomain.com',
    debug: process.env.NODE_ENV === 'development',
  },
});
```

### Using with Proxy

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-plausible'],
  plausible: {
    domain: 'yourdomain.com',
    proxyEndpoint: '/api/analytics', // Will be handled by Nuxt server
  },
});
```

### Enable all Tracking Options

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-plausible'],
  plausible: {
    domain: 'yourdomain.com',
    trackPageviews: true, // Default
    trackEngagement: true, // Default
    trackOutboundLinks: true,
    trackFileDownloads: true,
    track404: true,
    debug: process.env.NODE_ENV === 'development',
  },
});
```

## License

MIT
