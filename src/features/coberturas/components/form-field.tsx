import type { Field } from '../data/fields'

export function FormField({ field }: { field: Field }) {
  const inputClass =
    'bg-paper border border-line-2 text-ink font-sans text-[14.5px] px-4 py-[12px] outline-none transition-[border-color,box-shadow] duration-[180ms] appearance-none w-full rounded-2xl focus:border-ember focus:shadow-[0_0_0_3px_rgba(232,168,32,0.12)] placeholder:text-muted'

  return (
    <div className={`flex flex-col gap-[7px] ${field.span === 'full' ? 'col-span-full' : ''}`}>
      <label className="text-[10.5px] tracking-[0.2em] uppercase text-muted font-semibold">{field.label}</label>
      {field.type === 'select' ? (
        <select className={inputClass}>
          <option value="">{field.placeholder}</option>
          {field.options?.map(o => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input type={field.type ?? 'text'} className={inputClass} placeholder={field.placeholder} />
      )}
    </div>
  )
}
