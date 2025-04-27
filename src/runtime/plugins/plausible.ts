import { defu } from 'defu';
import { consola } from 'consola';
import { defineNuxtPlugin, useRouter, useRuntimeConfig } from '#app';

const TRACKER_SCRIPT_VERSION = 5;

declare module '#app' {
  interface RuntimeNuxtHooks {
    'plausible:track': (payload: {
      eventName: string;
      payload: PlausiblePayload;
      addProp: (key: string, value: unknown) => void;
      addRevenue: (value: { amount: number; currency: string }) => void;
    }) => Promise<void>;
  }
}

export type PlausiblePayload = {
  /**
   * Domain name of the site in Plausible
   * @description This is the domain name you used when you added your site to your Plausible account
   */
  d?: string;
  /**
   * The name of the event.
   * @description Name of the event. Can specify `pageview` which is a special type of event in Plausible. All other names will be treated as custom events.
   */
  n?: string;
  /**
   * The URL of the event.
   * @description The hostname derived from `url` takes part in unique visitor recognition..
   *
   */
  u?: string;
  /**
   * Referrer for this event
   */
  r?: string | null;
  /**
   * Hashed page paths
   */
  h?: '0' | '1';
  /**
   * Custom properties for the event. These can be attached to both pageviews and custom events.
   */

  p?: Record<string, unknown>;
  /**
   * Revenue data for this event. This can be attached to goals and custom events to track revenue attribution.
   */
  $?: { amount: number; currency: string };
  /**
   * Whether the event is interactive. By default, Plausible will assume all events are interactive and will be counted for bounce detection.
   */
  i?: boolean;
  /**
   * Scroll depth for the event. This is a number between 0 and 100 that indicates how far down the page the user scrolled.
   * @description This is only used for `engagement` and is not sent for custom events.
   */
  sd?: number;
  /**
   * Engagement time for the event. This is a number in seconds that indicates how long the user spent on the page.
   * @description This is only used for `engagement` and is not sent for custom events.
   */
  e?: number;
  /**
   * The version of the tracker script.
   */
  v?: number;
};

export default defineNuxtPlugin((nuxtApp) => {
  const plausible = async (eventName: string, payload: PlausiblePayload) => {
    const config = useRuntimeConfig().public.plausible;

    // give the user a chance to modify the payload before sending (props, revenue, etc.)
    function addProp(key: string, value: unknown) {
      payload.p = defu(payload.p, {});
      payload.p[key] = value;
    }
    function addRevenue(value: { amount: number; currency: string }) {
      payload.$ = value;
    }
    await nuxtApp.callHook('plausible:track', { eventName, payload, addProp, addRevenue });

    const body = defu(payload, {
      d: config.domain ?? window.location.hostname,
      n: eventName,
      u: window.location.pathname,
      h: !useRouter().options?.history ? '1' : undefined,
      v: TRACKER_SCRIPT_VERSION,
    });

    if (config.debug) consola.log('plausible:track', body.n, body.u, body.e);

    try {
      return navigator.sendBeacon(config.apiEndpoint, JSON.stringify(body));
    } catch {
      return $fetch(config.apiEndpoint, {
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'text/plain',
          ...(config.debug && { 'X-Debug-Request': 'true' }),
        },
        body,
      });
    }
  };

  return {
    provide: {
      plausible,
    },
  };
});
