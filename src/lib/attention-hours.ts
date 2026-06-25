/**
 * App-level fallback for the attention window shown across the site. The live
 * value is the producer's `attentionHours`, edited once from the admin
 * "Configuración" screen and served by GET /public/producer — this constant is
 * only the SSR/initial value and the offline fallback, kept in sync with the
 * API's DEFAULT_ATTENTION_HOURS so the two never contradict.
 */
export const DEFAULT_ATTENTION_HOURS = 'Lunes a viernes de 8 a 16 hs'
