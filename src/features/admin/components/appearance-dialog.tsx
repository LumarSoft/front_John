'use client'

import { Check, Monitor, Moon, Sun, type LucideIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog'
import { cn } from '@/src/lib/utils'
import { usePanelTheme } from '../context/panel-theme-context'
import { PANEL_PALETTES, type PanelMode, type PanelPalette } from '../lib/panel-theme'

const MODE_OPTIONS: { mode: PanelMode; label: string; icon: LucideIcon }[] = [
  { mode: 'light', label: 'Claro', icon: Sun },
  { mode: 'dark', label: 'Oscuro', icon: Moon },
  { mode: 'system', label: 'Automático', icon: Monitor },
]

const optionClasses = (selected: boolean): string =>
  cn(
    'rounded-xl border bg-paper text-left outline-none transition-[border-color,box-shadow] focus-visible:ring-3 focus-visible:ring-ember-ring',
    selected ? 'border-ember shadow-[0_0_0_3px_var(--color-ember-soft)]' : 'border-line-2 hover:border-line-strong',
  )

// A tiny panel drawn with the palette's own tokens, in the current mode.
function PalettePreview({ id }: { id: PanelPalette['id'] }) {
  return (
    <div data-palette={id} aria-hidden className="flex h-[68px] overflow-hidden rounded-lg bg-sidebar">
      <div className="flex w-[34%] flex-col gap-1.5 p-2">
        <span className="h-1.5 w-3/4 rounded-full bg-ink-3/25" />
        <span className="flex h-3 items-center rounded-[4px] bg-ember-soft px-1">
          <span className="h-1 w-3/4 rounded-full bg-ember-2" />
        </span>
        <span className="h-1.5 w-2/3 rounded-full bg-ink-3/25" />
        <span className="h-1.5 w-1/2 rounded-full bg-ink-3/25" />
      </div>
      <div className="my-1.5 mr-1.5 flex flex-1 flex-col gap-1.5 rounded-md bg-background p-2 shadow-[0_0_0_1px_var(--color-line)]">
        <span className="h-1.5 w-2/3 rounded-full bg-ink/70" />
        <span className="h-1.5 w-1/2 rounded-full bg-faint-2/50" />
        <span className="mt-auto flex items-center gap-1">
          <span className="h-3 w-8 rounded-[4px] bg-ember" />
          <span className="h-3 w-5 rounded-[4px] bg-canvas-2" />
        </span>
      </div>
    </div>
  )
}

export function AppearanceDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { mode, palette, isDark, setMode, setPalette } = usePanelTheme()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="font-display text-[17px] tracking-[-0.01em]">Apariencia</DialogTitle>
          <DialogDescription>
            Elegí cómo se ve el panel. Se guarda en este navegador y no cambia nada para los demás.
          </DialogDescription>
        </DialogHeader>

        <section className="flex flex-col gap-2.5">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Modo</h3>
          <div role="radiogroup" aria-label="Modo" className="grid grid-cols-3 gap-2">
            {MODE_OPTIONS.map(option => {
              const selected = option.mode === mode
              return (
                <button
                  key={option.mode}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setMode(option.mode)}
                  className={cn(optionClasses(selected), 'flex flex-col items-center gap-1.5 px-2 py-3')}
                >
                  <option.icon className={cn('size-[18px]', selected ? 'text-ember-2' : 'text-faint')} />
                  <span className={cn('text-[13px]', selected ? 'font-semibold text-ink' : 'text-ink-3')}>
                    {option.label}
                  </span>
                </button>
              )
            })}
          </div>
          {mode === 'system' && (
            <p className="text-[12px] text-muted-foreground">
              Sigue el modo de tu computadora (ahora está en {isDark ? 'oscuro' : 'claro'}).
            </p>
          )}
        </section>

        <section className="flex flex-col gap-2.5">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Colores</h3>
          <div role="radiogroup" aria-label="Colores" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {PANEL_PALETTES.map(option => {
              const selected = option.id === palette
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setPalette(option.id)}
                  className={cn(optionClasses(selected), 'flex flex-col gap-2 p-1.5')}
                >
                  <PalettePreview id={option.id} />
                  <span className="flex items-start justify-between gap-2 px-1 pb-0.5">
                    <span className="grid leading-tight">
                      <span className={cn('text-[13px] text-ink', selected && 'font-semibold')}>{option.label}</span>
                      <span className="text-[11.5px] text-muted-foreground">{option.description}</span>
                    </span>
                    {selected && <Check className="mt-0.5 size-4 shrink-0 text-ember-2" />}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      </DialogContent>
    </Dialog>
  )
}
