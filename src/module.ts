import { defineNuxtModule, addPlugin, createResolver, addServerHandler, addImports } from '@nuxt/kit';
import { defu } from 'defu';

// Module options TypeScript interface definition
export interface ModuleOptions {
  /**
   * The domain of your Plausible Analytics instance.
   * @default 'plausible.io'
   */
  domain?: string;
  /**
   * The API endpoint of your Plausible Analytics instance.
   * @default 'https://plausible.io/api/event'
   */
  apiEndpoint?: string;
  /**
   * The proxy endpoint.
   *
   * @remark Useful for proxying requests to Plausible Analytics through your own server.
   * @default undefined
   */
  proxyEndpoint?: string;
  /**
   * Track the current page and all further pages automatically.
   *
   * @default true
   */
  trackPageviews?: boolean;
  /**
   * Track the engagements automatically.
   *
   * @default true
   */
  trackEngagement?: boolean;
  /**
   * Track outbound links automatically.
   *
   * @default false
   */
  trackOutboundLinks?: boolean;
  /**
   * Track file downloads automatically.
   * You can specify an comma separated of file extensions to track.
   * For example: 'pdf,docx,xlsx'
   * if '*', theses files will be tracked : ['pdf', 'xlsx', 'docx', 'txt', 'rtf', 'csv', 'exe', 'key', 'pps', 'ppt', 'pptx', '7z', 'pkg', 'rar', 'gz', 'zip', 'avi', 'mov', 'mp4', 'mpeg', 'wmv', 'midi', 'mp3', 'wav', 'wma', 'dmg'].
   * @default ''
   */
  trackFileDownloads?: string | boolean;
  /**
   * Track 404 automatically.
   */
  track404?: boolean;
  /**
   * Debug
   */
  debug?: boolean;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-plausible-client',
    configKey: 'plausible',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    apiEndpoint: 'https://plausible.io/api/event',
    trackPageviews: true,
    trackEngagement: true,
    track404: false,
    debug: false,
    trackOutboundLinks: false,
    trackFileDownloads: '',
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);

    // Add module options to public runtime config
    nuxt.options.runtimeConfig.public.plausible = defu(nuxt.options.runtimeConfig.public.plausible, {
      domain: options.domain,
      apiEndpoint: options.proxyEndpoint ?? options.apiEndpoint,
      debug: options.debug,
      trackOutboundLinks: options.trackOutboundLinks,
      trackFileDownloads:
        options.trackFileDownloads === true
          ? [
              'pdf',
              'xlsx',
              'docx',
              'txt',
              'rtf',
              'csv',
              'exe',
              'key',
              'pps',
              'ppt',
              'pptx',
              '7z',
              'pkg',
              'rar',
              'gz',
              'zip',
              'avi',
              'mov',
              'mp4',
              'mpeg',
              'wmv',
              'midi',
              'mp3',
              'wav',
              'wma',
              'dmg',
            ].join(',')
          : (options.trackFileDownloads ?? ''),
    });
    nuxt.options.runtimeConfig.plausible = defu(nuxt.options.runtimeConfig.plausible as Required<ModuleOptions>, {
      apiEndpoint: options.apiEndpoint,
    });

    // Transpile runtime
    nuxt.options.build.transpile.push(resolve('runtime'));

    if (options.proxyEndpoint) {
      addServerHandler({
        route: options.proxyEndpoint,
        handler: resolve('runtime/server/proxy'),
      });
    }

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin({
      src: resolve('runtime/plugins/plausible'),
      mode: 'client',
      order: 0,
    });

    addImports(
      ['plausible'].map((name) => ({
        name,
        as: name,
        from: resolve(`runtime/utils/${name}`),
      })),
    );

    if (options.trackPageviews || options.trackEngagement) {
      addPlugin({
        src: resolve('runtime/plugins/pageview'),
        mode: 'client',
        order: 1,
      });
    }
    if (options.trackEngagement) {
      addPlugin({
        src: resolve('runtime/plugins/engagement'),
        mode: 'client',
        order: 2,
      });
    }
    if (options.track404) {
      addPlugin({
        src: resolve('runtime/plugins/404'),
        mode: 'client',
        order: 3,
      });
    }
    if (options.trackOutboundLinks || options.trackFileDownloads) {
      addPlugin({
        src: resolve('runtime/plugins/links'),
        mode: 'client',
        order: 3,
      });
    }
  },
});
