import { useState } from 'react'
import { Loader2, RefreshCw, Save } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { ApiError } from '@/src/lib/api-client'
import type { Campaign, CampaignTemplate } from '@/src/types/api/campaigns'
import { useCampaignEditor } from '../hooks/use-campaign-editor'
import { REVIEW_CLASSES, REVIEW_LABELS } from '../lib/campaigns-format'

const failed = (error: unknown, fallback: string) =>
  toast.error(error instanceof ApiError && error.status < 500 ? error.message : fallback)

/** The message as WhatsApp shows it, on the chat background (the inbox's WhatsApp palette). */
function MessagePreview({ text }: { text: string }) {
  return (
    <div className="wa wa-wallpaper rounded-xl p-4">
      <div className="ml-auto max-w-[92%] whitespace-pre-wrap rounded-lg rounded-tr-none bg-(--wa-bubble-out) px-3 py-2 text-[13.5px] leading-relaxed text-(--wa-text) shadow-sm">
        {text}
      </div>
    </div>
  )
}

/** Where Meta's review stands in each WhatsApp account of the organization. */
function TemplateStatusList({ templates }: { templates: CampaignTemplate[] }) {
  if (!templates.length) {
    return (
      <p className="text-[12.5px] text-muted-foreground">
        La organización todavía no tiene un número de WhatsApp conectado para mandar el mensaje a Meta.
      </p>
    )
  }
  return (
    <ul className="flex flex-col gap-2">
      {templates.map((template, i) => (
        <li key={`${template.wabaName ?? 'cuenta'}-${i}`} className="rounded-lg border border-line-2 px-3 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-[13px] font-medium text-ink">
                {template.wabaName ?? 'Cuenta de WhatsApp'}
              </div>
              <div className="text-[11.5px] text-muted-foreground">{template.numbers.join(', ') || 'Sin números'}</div>
            </div>
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${REVIEW_CLASSES[template.status]}`}
            >
              {REVIEW_LABELS[template.status]}
            </span>
          </div>
          {template.reason && <p className="mt-1.5 text-[12px] text-destructive">{template.reason}</p>}
        </li>
      ))}
    </ul>
  )
}

/** "Mensaje": the text the clients receive, the percentage, the campaign's settings and Meta's review. */
export function CampaignMessageTab({ campaign }: { campaign: Campaign }) {
  const {
    textareaRef,
    body,
    setBody,
    percent,
    setPercent,
    settings,
    setSetting,
    preview,
    error: draftError,
    dirty,
    bodyChanged,
    changes,
    insertPlaceholder,
    update,
    refreshTemplates,
  } = useCampaignEditor(campaign)
  const [confirmBody, setConfirmBody] = useState(false)

  const save = () => {
    setConfirmBody(false)
    update.mutate(
      { kind: campaign.kind, data: changes },
      {
        onSuccess: () =>
          toast.success(bodyChanged ? 'Mensaje guardado y enviado a revisión de Meta' : 'Campaña guardada'),
        onError: error => failed(error, 'No se pudo guardar la campaña'),
      },
    )
  }
  const requestSave = () => (bodyChanged ? setConfirmBody(true) : save())
  const askMeta = () =>
    refreshTemplates.mutate(campaign.kind, {
      onSuccess: () => toast.success('Estado actualizado con Meta'),
      onError: error => failed(error, 'No se pudo consultar a Meta'),
    })

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`campaign-body-${campaign.kind}`}>Mensaje</Label>
          <textarea
            id={`campaign-body-${campaign.kind}`}
            ref={textareaRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={6}
            className="rounded-md border border-line-2 bg-background px-3 py-2 text-[13.5px] leading-relaxed text-ink"
          />
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11.5px] text-muted-foreground">Insertar dato:</span>
            {campaign.placeholders.map(placeholder => (
              <button
                key={placeholder.key}
                type="button"
                onClick={() => insertPlaceholder(placeholder.key)}
                title={`Ejemplo: ${placeholder.example}`}
                className="rounded-full border border-line-2 bg-secondary px-2 py-0.5 text-[11.5px] text-ink-3 hover:border-ember-ring hover:bg-ember-soft hover:text-ember-2"
              >
                {placeholder.label}
              </button>
            ))}
          </div>
          <p className="text-[12px] text-muted-foreground">
            Cada dato entre llaves se completa con el del cliente. El mensaje no puede empezar ni terminar con un dato.
            Si cambiás el texto, Meta lo vuelve a revisar; el porcentaje se puede cambiar cuando quieras.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`campaign-percent-${campaign.kind}`}>Beneficio (%)</Label>
            <Input
              id={`campaign-percent-${campaign.kind}`}
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              step={1}
              value={percent}
              onChange={e => setPercent(e.target.value)}
              className="border-line-2"
            />
            <p className="text-[12px] text-muted-foreground">Va en el lugar de {'{porcentaje}'}.</p>
          </div>
          {campaign.settingFields.map(field => (
            <div key={field.key} className="flex flex-col gap-2">
              <Label htmlFor={`campaign-${campaign.kind}-${field.key}`}>{field.label}</Label>
              <Input
                id={`campaign-${campaign.kind}-${field.key}`}
                type={field.type === 'number' ? 'number' : 'text'}
                inputMode={field.type === 'number' ? 'numeric' : undefined}
                min={field.min}
                max={field.max}
                value={settings[field.key] ?? ''}
                onChange={e => setSetting(field.key, e.target.value)}
                placeholder={field.type === 'codes' ? 'A, B, B1' : undefined}
                className="border-line-2"
              />
              <p className="text-[12px] text-muted-foreground">{field.help}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={requestSave} disabled={!dirty || !!draftError || update.isPending}>
            {update.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Guardar
          </Button>
          {draftError && dirty && <span className="text-[12.5px] text-destructive">{draftError}</span>}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="text-[11px] uppercase tracking-[0.12em] text-faint">Así lo ve el cliente</div>
          <MessagePreview text={preview} />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] uppercase tracking-[0.12em] text-faint">Revisión de Meta</div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={askMeta}
              disabled={refreshTemplates.isPending || campaign.templates.length === 0}
              className="h-8 border-line-2 text-[12px]"
            >
              {refreshTemplates.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
              Consultar a Meta
            </Button>
          </div>
          <TemplateStatusList templates={campaign.templates} />
          <p className="text-[11.5px] text-muted-foreground">
            Es un solo texto para todos los números de la organización. Un número que se conecta después lo recibe solo
            en menos de una hora, y Meta lo revisa en su cuenta.
          </p>
        </div>
      </div>

      <AlertDialog open={confirmBody} onOpenChange={open => !open && setConfirmBody(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mandar el mensaje nuevo a Meta</AlertDialogTitle>
            <AlertDialogDescription>
              El mensaje nuevo se manda a revisión de Meta (de minutos a un día). Hasta que lo aprueben no se puede
              enviar esta campaña.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={save}>Guardar y mandar a Meta</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
