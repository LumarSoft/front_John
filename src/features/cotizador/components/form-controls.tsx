export const inputClass =
  'bg-paper border border-line-2 text-ink font-sans text-[14.5px] px-4 py-[12px] pr-10 outline-none transition-[border-color,box-shadow] duration-[180ms] appearance-none w-full rounded-2xl focus:border-ember focus:shadow-[0_0_0_3px_rgba(232,168,32,0.12)] placeholder:text-faint'

export const labelClass = 'text-[10.5px] tracking-[0.2em] uppercase text-faint font-semibold'

export const Chevron = () => (
  <svg
    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
