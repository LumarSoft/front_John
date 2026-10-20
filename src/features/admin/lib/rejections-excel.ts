import type { CreateRejectionImportRequest, RejectionRowInput } from '@/src/types/api/rejections'

/** Columns of Triunfo's "Planilla de rechazos por débito automático", by their header. */
const COLUMNS = {
  holderName: 'Asegurado',
  branch: 'Art.',
  certificateNumber: 'Certificado',
  endorsementNumber: 'Suplemento',
  installmentNumber: 'Cuota',
  dueDate: 'Vencimiento',
  amount: 'Importe',
  entity: 'Entidad',
  account: 'CBU/Cta.',
  reason: 'Motivo',
  homePhone: 'Tel. Particular',
  mobilePhone: 'Tel. Celular',
  stillPending: '¿Cuota aún pendiente?',
} as const

const REQUIRED: (keyof typeof COLUMNS)[] = [
  'holderName',
  'certificateNumber',
  'installmentNumber',
  'dueDate',
  'amount',
  'entity',
  'reason',
  'stillPending',
]

/** What is wrong with the file, said for the office. */
export class RejectionsExcelError extends Error {}

type Cell = string | number | boolean | Date | null | undefined

/**
 * Reads Triunfo's Excel of rejected debits (CBU or card, same layout) in the
 * browser. Only the last digits of the CBU or card leave it.
 */
export async function readRejectionsExcel(file: File): Promise<CreateRejectionImportRequest> {
  const XLSX = await import('xlsx')
  let grid: Cell[][]
  try {
    const book = XLSX.read(await file.arrayBuffer(), { type: 'array' })
    grid = XLSX.utils.sheet_to_json<Cell[]>(book.Sheets[book.SheetNames[0]], { header: 1, defval: '', raw: true })
  } catch {
    throw new RejectionsExcelError(
      'No se pudo leer el archivo. Tiene que ser el Excel de rechazos que baja de Triunfo.',
    )
  }

  const headerAt = grid.findIndex(row => normalize(row[0]) === normalize(COLUMNS.holderName))
  if (headerAt < 0) {
    throw new RejectionsExcelError(
      'Este Excel no parece la planilla de rechazos de Triunfo: no tiene la columna «Asegurado».',
    )
  }
  const header = grid[headerAt].map(normalize)
  const columnOf = (key: keyof typeof COLUMNS) => header.indexOf(normalize(COLUMNS[key]))
  const missing = REQUIRED.filter(key => columnOf(key) < 0).map(key => `«${COLUMNS[key]}»`)
  if (missing.length) throw new RejectionsExcelError(`Al Excel le faltan columnas: ${missing.join(', ')}.`)

  const title = grid.slice(0, headerAt).map(row => text(row[0]))
  const period = title.map(line => line.match(/desde:.*$/i)?.[0]).find(Boolean)
  const producerCode = title.map(line => line.match(/intermediario:\s*(\d+)/i)?.[1]).find(Boolean)

  const rows: RejectionRowInput[] = []
  for (let index = headerAt + 1; index < grid.length; index++) {
    const row = grid[index]
    const cell = (key: keyof typeof COLUMNS) => {
      const at = columnOf(key)
      return at < 0 ? undefined : row[at]
    }
    const holderName = text(cell('holderName'))
    if (!holderName) continue
    const rowNumber = index + 1

    const certificateNumber = digits(cell('certificateNumber'))
    const installmentNumber = integer(cell('installmentNumber'))
    const dueDate = isoDate(cell('dueDate'))
    const amount = money(cell('amount'))
    if (!certificateNumber || installmentNumber === undefined || !dueDate || amount === undefined) {
      throw new RejectionsExcelError(
        `La fila ${rowNumber} (${holderName}) tiene el certificado, la cuota, el vencimiento o el importe vacíos o mal escritos.`,
      )
    }

    rows.push({
      rowNumber,
      holderName,
      branch: integer(cell('branch')),
      certificateNumber,
      endorsementNumber: integer(cell('endorsementNumber')),
      installmentNumber,
      dueDate,
      amount,
      entity: text(cell('entity')) || 'Sin entidad',
      accountLast4: digits(cell('account')).slice(-4) || undefined,
      reason: text(cell('reason')) || 'Sin motivo',
      stillPending: normalize(cell('stillPending')) !== 'no',
      mobilePhone: text(cell('mobilePhone')) || undefined,
      homePhone: text(cell('homePhone')) || undefined,
    })
  }
  if (!rows.length) throw new RejectionsExcelError('El Excel no tiene rechazos cargados.')

  return { fileName: file.name, periodLabel: period, producerCode, rows }
}

function text(value: Cell): string {
  if (value === null || value === undefined) return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

/** Lowercase, no accents nor ¿?, for comparing headers and SI/NO. */
function normalize(value: Cell): string {
  return text(value).toLowerCase().normalize('NFD').replace(/[̀-ͯ¿?]/g, '').trim()
}

function digits(value: Cell): string {
  return text(value).replace(/\D/g, '')
}

function integer(value: Cell): number | undefined {
  const parsed = typeof value === 'number' ? value : Number(text(value))
  return text(value) !== '' && Number.isInteger(parsed) ? parsed : undefined
}

/** 90315, "90315", "90.315,50" or "90315.5". */
function money(value: Cell): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : undefined
  const raw = text(value).replace(/[$\s]/g, '')
  if (!raw) return undefined
  const parsed = Number(raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

/** "28/09/2026", an Excel date serial or a Date, as YYYY-MM-DD. */
function isoDate(value: Cell): string | undefined {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === 'number') {
    // Excel counts days from 1899-12-30.
    const date = new Date(Date.UTC(1899, 11, 30) + Math.round(value) * 86_400_000)
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10)
  }
  const match = text(value).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!match) return undefined
  const [, day, month, year] = match
  const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  const check = new Date(`${iso}T00:00:00Z`)
  return check.getUTCDate() === Number(day) && check.getUTCMonth() + 1 === Number(month) ? iso : undefined
}
