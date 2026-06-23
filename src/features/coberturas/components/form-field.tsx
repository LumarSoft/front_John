import type { Field } from '../data/fields'

interface FormFieldProps {
  field: Field
  value: string
  onChange: (value: string) => void
  invalid?: boolean
}

export function FormField({ field, value, onChange, invalid = false }: Readonly<FormFieldProps>) {
  const inputClass = `bg-paper border text-ink font-sans text-[14.5px] px-4 py-[12px] outline-none transition-[border-color,box-shadow] duration-[180ms] appearance-none w-full rounded-2xl focus:border-ember focus:shadow-[0_0_0_3px_rgba(232,168,32,0.12)] placeholder:text-faint ${
    invalid ? 'border-red-400' : 'border-line-2'
  }`

  return (
    <div className={`flex flex-col gap-[7px] ${field.span === 'full' ? 'col-span-full' : ''}`}>
      <label className="text-[10.5px] tracking-[0.2em] uppercase text-faint font-semibold">{field.label}</label>
      {field.type === 'select' ? (
        <select className={inputClass} value={value} onChange={e => onChange(e.target.value)}>
          <option value="">{field.placeholder}</option>
          {field.options?.map(o => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type ?? 'text'}
          className={inputClass}
          placeholder={field.placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      )}
    </div>
  )
}
