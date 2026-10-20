import { useState } from 'react'
import { toast } from 'sonner'
import { ApiError } from '@/src/lib/api-client'
import { readRejectionsExcel, RejectionsExcelError } from '../lib/rejections-excel'
import { useRejectionActions } from './use-rejections'

/** Reads Triunfo's Excel in the browser and stores its rows; `onLoaded` gets the new import. */
export function useRejectionUpload(onLoaded: (importId: number) => void) {
  const { create } = useRejectionActions()
  const [reading, setReading] = useState(false)

  async function upload(file: File) {
    setReading(true)
    try {
      const data = await readRejectionsExcel(file)
      const created = await create.mutateAsync(data)
      const ready = created.rows.filter(row => row.status === 'READY').length
      toast.success(`Excel cargado: ${created.rows.length} rechazos, ${ready} para avisar.`)
      onLoaded(created.id)
    } catch (error) {
      const message =
        error instanceof RejectionsExcelError || error instanceof ApiError
          ? error.message
          : 'No se pudo cargar el Excel. Probá de nuevo.'
      toast.error(message)
    } finally {
      setReading(false)
    }
  }

  return { upload, busy: reading || create.isPending }
}
