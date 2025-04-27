import type { PlausiblePayload } from '../plugins/plausible';
import { useNuxtApp } from '#app';

export const plausible = (eventName: string, payload: PlausiblePayload) => useNuxtApp().$plausible(eventName, payload);
