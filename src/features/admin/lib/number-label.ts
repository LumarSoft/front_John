/** A WhatsApp number as the office knows it: "+54 9 341 275-7294 · 27 de Febrero", or just the number. */
export function numberLabel({ number, branchName }: { number: string; branchName?: string | null }): string {
  return branchName ? `${number} · ${branchName}` : number
}
