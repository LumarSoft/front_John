import type { Field } from '../data/fields'

export function FormField({ field }: { field: Field }) {
  const inputClass =
    'bg-surface border border-line-2 text-cream font-sans text-[15px] px-4 py-[13px] outline-none transition-[border-color] duration-[180ms] appearance-none w-full rounded-none focus:border-amber placeholder:text-muted'

  return (
    <div className={`flex flex-col gap-[7px] ${field.span === 'full' ? 'col-span-full' : ''}`}>
      <label className="text-[10.5px] tracking-[0.2em] uppercase text-muted font-medium">{field.label}</label>
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
