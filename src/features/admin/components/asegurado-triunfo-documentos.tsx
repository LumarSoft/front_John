'use client'

import { AlertCircle, Download, FileText, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import type { AdminClientDetail, AdminPolizaDetail, AdminPolizaDocumento } from '@/src/types/api/clients'
import { useAdminPolizaDocumentos, useDownloadPolizaDocumento } from '../hooks/use-admin-poliza-documentos'
import { policyName, RiskIcon } from '../lib/asegurados-ui'

function DocumentoRow({
  client,
  poliza,
  doc,
}: {
  client: AdminClientDetail
  poliza: AdminPolizaDetail
  doc: AdminPolizaDocumento
}) {
  const download = useDownloadPolizaDocumento(client.id, poliza)

  return (
    <div className="flex items-center gap-3 rounded-xl border border-line-2 bg-paper px-4 py-2.5">
      <FileText className="size-4 shrink-0 text-ink-3" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-ink">{doc.name}</p>
        {download.isError && (
          <p className="text-[11.5px] text-red-600 dark:text-red-400">Triunfo no entregó el archivo. Probá de nuevo.</p>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => download.mutate(doc)}
        disabled={download.isPending}
        className="h-7 gap-1.5 px-2 text-[12px] text-ink-3 hover:bg-ember-soft hover:text-ember-2"
      >
        {download.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
        Descargar
      </Button>
    </div>
  )
}

/** The documents Triunfo has for one policy, each downloadable as a PDF. */
export function TriunfoDocumentosCard({ client, poliza }: { client: AdminClientDetail; poliza: AdminPolizaDetail }) {
  const { data, isLoading, isError, isFetching, refetch } = useAdminPolizaDocumentos(client.id, poliza.id)

  const subject = [poliza.vehicle?.brand, poliza.vehicle?.model].filter(Boolean).join(' ') || policyName(poliza)

  return (
    <div className="overflow-hidden rounded-2xl border border-line-2 bg-card">
      <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-canvas-2 text-ink-3">
          <RiskIcon type={poliza.riskType} className="size-4.5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-ink">{subject}</p>
          <p className="text-[11.5px] text-muted-foreground">
            Póliza {poliza.certificateNumber}
            {poliza.vehicle?.licensePlate ? ` · ${poliza.vehicle.licensePlate}` : ''}
          </p>
        </div>
      </div>

      <div className="px-5 py-4">
        {isLoading && (
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Buscando los documentos en Triunfo…
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-[13px] text-red-600 dark:text-red-400">
              <AlertCircle className="size-4" />
              No se pudieron traer los documentos de Triunfo.
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-7 gap-1.5 px-2.5 text-[12px]"
            >
              <RefreshCw className="size-3.5" />
              Reintentar
            </Button>
          </div>
        )}

        {data &&
          (data.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">Triunfo no tiene documentos para esta póliza.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {data.map(doc => (
                <DocumentoRow key={doc.code} client={client} poliza={poliza} doc={doc} />
              ))}
            </div>
          ))}
      </div>
    </div>
  )
}
