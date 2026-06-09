'use client'

import { SelectSearch } from './select-search'
import { useCotizadorAutoForm } from '../hooks/use-cotizador-auto-form'

const YEARS = Array.from({ length: 31 }, (_, i) => new Date().getFullYear() - i)

const inputClass =
  'bg-paper border border-line-2 text-ink font-sans text-[14.5px] px-4 py-[12px] pr-10 outline-none transition-[border-color,box-shadow] duration-[180ms] appearance-none w-full rounded-2xl focus:border-ember focus:shadow-[0_0_0_3px_rgba(232,168,32,0.12)] placeholder:text-faint'

const labelClass = 'text-[10.5px] tracking-[0.2em] uppercase text-faint font-semibold'

const Chevron = () => (
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

export function CotizadorAutoForm() {
  const {
    form,
    brandOptions,
    groupOptions,
    modelOptions,
    loadingBrands,
    loadingGroups,
    loadingModels,
    isPending,
    result,
    cotizarError,
    isValid,
    handleBrandChange,
    handleGroupChange,
    handleCodiaChange,
    handleYearChange,
    handlePostalCodeChange,
    handleNameChange,
    handlePhoneChange,
    handleEmailChange,
    handleSubmit,
    reset,
  } = useCotizadorAutoForm()

  if (result) {
    const presupuestoNro = result.SDTSrvCotizacionOut?.Presupuesto?.Numero
    return (
      <div className="flex flex-col items-center gap-8 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-ember/10 flex items-center justify-center border border-ember/30">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--color-ember)" strokeWidth="2.2">
            <path d="M5 14l6 6L23 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h3 className="font-display text-[26px] text-ink m-0 mb-3">¡Cotización generada!</h3>
          {presupuestoNro && (
            <p className="text-[13px] text-faint tracking-[0.02em] mb-2">
              Nro. de presupuesto: <span className="text-ink font-semibold">{presupuestoNro}</span>
            </p>
          )}
          <p className="text-[14px] text-ink-3 leading-[1.65] max-w-[380px] mx-auto mt-3">
            Nos pondremos en contacto a la brevedad con los detalles de tu cobertura.
          </p>
        </div>
        <button
          onClick={reset}
          className="text-[12px] tracking-[-0.005em] font-semibold text-ember-2 hover:text-ember transition-colors duration-[180ms] bg-transparent border-none cursor-pointer"
        >
          Nueva cotización →
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="text-[10.5px] tracking-[0.24em] uppercase text-faint font-semibold mb-[18px]">
        Datos del vehículo
      </div>

      <div className="grid grid-cols-2 gap-[14px] max-[560px]:grid-cols-1">
        <div className="flex flex-col gap-[7px]">
          <label className={labelClass}>Marca</label>
          <SelectSearch
            options={brandOptions}
            value={form.brandId ? String(form.brandId) : ''}
            onChange={handleBrandChange}
            placeholder="Buscá una marca…"
            loading={loadingBrands}
          />
        </div>

        <div className="flex flex-col gap-[7px]">
          <label className={labelClass}>Año</label>
          <div className="relative">
            <select className={inputClass} value={form.year ?? ''} onChange={e => handleYearChange(e.target.value)}>
              <option value="">Seleccioná el año</option>
              {YEARS.map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <Chevron />
          </div>
        </div>

        <div className="flex flex-col gap-[7px]">
          <label className={`${labelClass} ${!form.brandId ? 'opacity-40' : ''}`}>Modelo</label>
          <SelectSearch
            options={groupOptions}
            value={form.groupId ? String(form.groupId) : ''}
            onChange={handleGroupChange}
            placeholder="Buscá el modelo…"
            disabledPlaceholder="Primero elegí una marca"
            disabled={!form.brandId}
            loading={loadingGroups}
          />
        </div>

        <div className="flex flex-col gap-[7px]">
          <label className={`${labelClass} ${!form.groupId ? 'opacity-40' : ''}`}>Versión</label>
          <SelectSearch
            options={modelOptions}
            value={form.codia ? String(form.codia) : ''}
            onChange={handleCodiaChange}
            placeholder="Buscá la versión…"
            disabledPlaceholder="Primero elegí el modelo"
            disabled={!form.groupId}
            loading={loadingModels}
          />
        </div>

        <div className="flex flex-col gap-[7px]">
          <label className={labelClass}>Código postal</label>
          <input
            type="text"
            inputMode="numeric"
            className={inputClass}
            placeholder="1425"
            value={form.postalCode}
            onChange={e => handlePostalCodeChange(e.target.value)}
          />
        </div>
      </div>

      <hr className="border-0 border-t border-line my-7" />

      <div className="text-[10.5px] tracking-[0.24em] uppercase text-faint font-semibold mb-[18px]">
        Tus datos de contacto
      </div>

      <div className="grid grid-cols-2 gap-[14px] max-[560px]:grid-cols-1">
        <div className="flex flex-col gap-[7px]">
          <label className={labelClass}>Nombre y apellido</label>
          <input
            type="text"
            className={inputClass}
            placeholder="Juan García"
            value={form.name}
            onChange={e => handleNameChange(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-[7px]">
          <label className={labelClass}>Teléfono</label>
          <input
            type="tel"
            className={inputClass}
            placeholder="+54 9 341 000-0000"
            value={form.phone}
            onChange={e => handlePhoneChange(e.target.value)}
          />
        </div>
        <div className="col-span-full flex flex-col gap-[7px] max-[560px]:col-span-1">
          <label className={labelClass}>Correo electrónico</label>
          <input
            type="email"
            className={inputClass}
            placeholder="juan@ejemplo.com"
            value={form.email}
            onChange={e => handleEmailChange(e.target.value)}
          />
        </div>
      </div>

      {cotizarError && (
        <p className="mt-5 text-[13px] text-red-600 leading-[1.5]">
          Ocurrió un error al procesar la cotización. Por favor intentá de nuevo.
        </p>
      )}

      <div className="flex items-center gap-5 mt-8 flex-wrap">
        <button
          type="submit"
          disabled={!isValid || isPending}
          className="btn-shimmer inline-flex items-center gap-2 bg-ember text-paper border-none py-[14px] px-6 rounded-full font-semibold text-[13.5px] tracking-[-0.005em] cursor-pointer transition-[background-color,box-shadow,opacity] duration-[180ms] hover:bg-ember-2 hover:shadow-[0_12px_32px_-8px_rgba(232,168,32,0.55)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Cotizando…' : 'Solicitar cotización'}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-[12.5px] text-faint tracking-[-0.005em]">Te respondemos en menos de 24 hs hábiles</span>
      </div>
    </form>
  )
}
