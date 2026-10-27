/**
 * Hosts that serve the admin panel with the platform's neutral brand instead of
 * JPMG's, for the users of every other organization: PANEL_NEUTRAL_HOSTS, comma
 * separated (e.g. "panel.lumarsoft.com.ar"). Read on the server, per request.
 */
export function isNeutralPanelHost(host: string | null | undefined): boolean {
  const name = host?.split(':')[0].trim().toLowerCase()
  if (!name) return false
  return (process.env.PANEL_NEUTRAL_HOSTS ?? '')
    .split(',')
    .map(h => h.trim().toLowerCase())
    .filter(Boolean)
    .includes(name)
}
