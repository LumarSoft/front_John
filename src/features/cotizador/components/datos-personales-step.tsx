'use client'

import { Chevron, inputClass, labelClass } from './form-controls'
import { todayISO } from '../lib/dates'
import type { DatosPersonalesFormHook } from '../hooks/use-datos-personales-form'
import type { DocType, PersonType } from '@/src/types/api/cotizador'

const PERSON_TYPES: { value: PersonType; label: string }[] = [
  { value: 'FISICA', label: 'Persona física' },
  { value: 'JURIDICA', label: 'Persona jurídica' },
]

const FISICA_DOC_TYPES: DocType[] = ['DNI', 'CUIL', 'PASAPORTE']

const digitsOnly = (value: string): string => value.replace(/\D/g, '')
const alphanumericOnly = (value: string): string => value.replace(/[^0-9a-zA-Z]/g, '')

interface DatosPersonalesStepProps {
  form: DatosPersonalesFormHook
  onContinue: () => void
  onBack: () => void
}

export function DatosPersonalesStep({ form: hook, onContinue, onBack }: Readonly<DatosPersonalesStepProps>) {
  const { form, isFisica, isValid, setField, setPersonType } = hook

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isValid) onContinue()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="text-[10.5px] tracking-[0.24em] uppercase text-faint font-semibold mb-[6px]">Tus datos</div>
      <h3 className="font-display text-[24px] text-ink m-0 mb-2">Contanos quién contrata</h3>
      <p className="text-[13px] text-ink-3 leading-[1.65] m-0 mb-6 max-w-[420px]">
        Con estos datos preparamos la solicitud y te contactamos para coordinar la inspección del vehículo.
      </p>

      <div className="inline-flex self-start rounded-full border border-line-2 bg-paper p-1 mb-6">
        {PERSON_TYPES.map(type => {
          const selected = form.personType === type.value
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => setPersonType(type.value)}
              className={`py-[8px] px-4 rounded-full text-[12px] font-semibold tracking-[-0.005em] cursor-pointer border-none transition-[background-color,color] duration-[180ms] ${
                selected ? 'bg-ember text-paper' : 'bg-transparent text-faint hover:text-ink'
              }`}
            >
              {type.label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-[14px] max-[560px]:grid-cols-1">
        <div className={`flex flex-col gap-[7px] ${isFisica ? '' : 'col-span-2 max-[560px]:col-span-1'}`}>
          <label className={labelClass} htmlFor="applicant-first-name">
            {isFisica ? 'Nombre' : 'Razón social'}
          </label>
          <input
            id="applicant-first-name"
            type="text"
            className={inputClass}
            placeholder={isFisica ? 'Juan' : 'Empresa S.A.'}
            value={form.firstName}
            onChange={e => setField('firstName', e.target.value)}
          />
        </div>

        {isFisica && (
          <div className="flex flex-col gap-[7px]">
            <label className={labelClass} htmlFor="applicant-last-name">
              Apellido
            </label>
            <input
              id="applicant-last-name"
              type="text"
              className={inputClass}
              placeholder="Pérez"
              value={form.lastName}
              onChange={e => setField('lastName', e.target.value)}
            />
          </div>
        )}

        <div className="flex flex-col gap-[7px] col-span-2 max-[560px]:col-span-1">
          <label className={labelClass} htmlFor="applicant-email">
            Email
          </label>
          <input
            id="applicant-email"
            type="email"
            className={inputClass}
            placeholder="juan@email.com"
            value={form.email}
            onChange={e => setField('email', e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-[7px]">
          <label className={labelClass} htmlFor="applicant-area-code">
            Celular — código de área
          </label>
          <input
            id="applicant-area-code"
            type="text"
            inputMode="numeric"
            className={inputClass}
            placeholder="341"
            value={form.areaCode}
            onChange={e => setField('areaCode', digitsOnly(e.target.value))}
          />
          <span className="text-[10.5px] text-faint">Cód. sin 0</span>
        </div>

        <div className="flex flex-col gap-[7px]">
          <label className={labelClass} htmlFor="applicant-phone-number">
            Celular — número
          </label>
          <input
            id="applicant-phone-number"
            type="text"
            inputMode="numeric"
            className={inputClass}
            placeholder="3000000"
            value={form.phoneNumber}
            onChange={e => setField('phoneNumber', digitsOnly(e.target.value))}
          />
          <span className="text-[10.5px] text-faint">Número sin 15</span>
        </div>

        {isFisica && (
          <div className="flex flex-col gap-[7px]">
            <label className={labelClass} htmlFor="applicant-birth-date">
              Fecha de nacimiento
            </label>
            <div className="relative">
              <input
                id="applicant-birth-date"
                type="date"
                className={inputClass}
                value={form.birthDate}
                min="1900-01-01"
                max={todayISO()}
                onChange={e => setField('birthDate', e.target.value)}
              />
              <Chevron />
            </div>
          </div>
        )}

        {isFisica ? (
          <div className="flex flex-col gap-[7px]">
            <label className={labelClass} htmlFor="applicant-doc-type">
              Documento
            </label>
            <div className="grid grid-cols-[110px_1fr] gap-2">
              <div className="relative">
                <select
                  id="applicant-doc-type"
                  className={inputClass}
                  value={form.docType}
                  onChange={e => setField('docType', e.target.value as DocType)}
                >
                  {FISICA_DOC_TYPES.map(doc => (
                    <option key={doc} value={doc}>
                      {doc}
                    </option>
                  ))}
                </select>
                <Chevron />
              </div>
              <input
                aria-label="Número de documento"
                type="text"
                inputMode="numeric"
                className={inputClass}
                placeholder="30123456"
                value={form.docNumber}
                onChange={e => setField('docNumber', alphanumericOnly(e.target.value))}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-[7px]">
            <label className={labelClass} htmlFor="applicant-cuit">
              CUIT
            </label>
            <input
              id="applicant-cuit"
              type="text"
              inputMode="numeric"
              className={inputClass}
              placeholder="30123456789"
              value={form.docNumber}
              onChange={e => setField('docNumber', digitsOnly(e.target.value))}
            />
          </div>
        )}

        <div className="flex flex-col gap-[7px]">
          <label className={labelClass} htmlFor="applicant-street">
            Domicilio
          </label>
          <input
            id="applicant-street"
            type="text"
            className={inputClass}
            placeholder="Calle 1234"
            value={form.street}
            onChange={e => setField('street', e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-[7px]">
          <label className={labelClass} htmlFor="applicant-city">
            Localidad
          </label>
          <input
            id="applicant-city"
            type="text"
            className={inputClass}
            placeholder="Rosario, Santa Fe"
            value={form.city}
            onChange={e => setField('city', e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-5 mt-8 flex-wrap">
        <button
          type="submit"
          disabled={!isValid}
          className="btn-shimmer inline-flex items-center gap-2 bg-ember text-paper border-none py-[14px] px-6 rounded-full font-semibold text-[13.5px] tracking-[-0.005em] cursor-pointer transition-[background-color,box-shadow,opacity] duration-[180ms] hover:bg-ember-2 hover:shadow-[0_12px_32px_-8px_rgba(232,168,32,0.55)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onBack}
          className="text-[12px] tracking-[-0.005em] font-semibold text-ember-2 hover:text-ember transition-colors duration-[180ms] bg-transparent border-none cursor-pointer"
        >
          ← Volver a la fecha
        </button>
      </div>
    </form>
  )
}
