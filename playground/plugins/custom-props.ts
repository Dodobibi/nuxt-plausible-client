export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('plausible:track', async ({ addProp, addRevenue }) => {
    // give the user a chance to modify the payload before sending
    addProp('test', 'test');
    addProp('test2', 'test2');
    addRevenue({ amount: 100, currency: 'USD' });
  });
});
