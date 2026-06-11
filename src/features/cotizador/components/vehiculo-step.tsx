'use client'

import { SelectSearch } from './select-search'
import { Chevron, inputClass, labelClass } from './form-controls'
import type { CotizadorVehiculoFormHook } from '../hooks/use-cotizador-vehiculo-form'
import type { VehicleType } from '@/src/types/api/cotizador'

const YEARS = Array.from({ length: 31 }, (_, i) => new Date().getFullYear() - i)

interface VehiculoStepProps {
  form: CotizadorVehiculoFormHook
  vehicleType: VehicleType
}

export function VehiculoStep({ form: hook, vehicleType }: Readonly<VehiculoStepProps>) {
  const noun = vehicleType === 'moto' ? 'la moto' : 'tu auto'
  const {
    form,
    brandOptions,
    groupOptions,
    modelOptions,
    loadingBrands,
    loadingGroups,
    loadingModels,
    isPending,
    cotizarError,
    isValid,
    handleBrandChange,
    handleGroupChange,
    handleCodiaChange,
    handleYearChange,
    handlePostalCodeChange,
    handleSubmit,
  } = hook

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="text-[10.5px] tracking-[0.24em] uppercase text-faint font-semibold mb-[18px]">
        Datos de {noun}
      </div>

      <div className="grid grid-cols-2 gap-[14px] max-[560px]:grid-cols-1">
        <div className="flex flex-col gap-[7px]">
          <label className={labelClass} htmlFor="vehicle-brand">
            Marca
          </label>
          <SelectSearch
            inputId="vehicle-brand"
            options={brandOptions}
            value={form.brandId ? String(form.brandId) : ''}
            onChange={handleBrandChange}
            placeholder="Buscá una marca…"
            loading={loadingBrands}
          />
        </div>

        <div className="flex flex-col gap-[7px]">
          <label className={labelClass} htmlFor="vehicle-year">
            Año
          </label>
          <div className="relative">
            <select
              id="vehicle-year"
              className={inputClass}
              value={form.year ?? ''}
              onChange={e => handleYearChange(e.target.value)}
            >
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
          <label className={`${labelClass} ${!form.brandId ? 'opacity-40' : ''}`} htmlFor="vehicle-group">
            Modelo
          </label>
          <SelectSearch
            inputId="vehicle-group"
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
          <label className={`${labelClass} ${!form.groupId ? 'opacity-40' : ''}`} htmlFor="vehicle-model">
            Versión
          </label>
          <SelectSearch
            inputId="vehicle-model"
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
          <label className={labelClass} htmlFor="vehicle-postal-code">
            Código postal
          </label>
          <input
            id="vehicle-postal-code"
            type="text"
            inputMode="numeric"
            className={inputClass}
            placeholder="1425"
            value={form.postalCode}
            onChange={e => handlePostalCodeChange(e.target.value)}
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
