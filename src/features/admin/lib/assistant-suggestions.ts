import {
  CalendarClock,
  CalendarOff,
  Clock,
  FileText,
  Inbox,
  Landmark,
  Lightbulb,
  ListTodo,
  Search,
  ShieldAlert,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

/** A question the empty conversation offers. `fill` puts the text in the box to finish it instead of sending it. */
export interface AssistantSuggestion {
  label: string
  icon: LucideIcon
  fill?: string
}

const PENDING: AssistantSuggestion = { label: '¿Qué tengo pendiente hoy?', icon: Inbox }
const BANK: AssistantSuggestion = {
  label: 'Quiero cambiar los datos bancarios donde transfieren los clientes',
  icon: Landmark,
}
const EXPIRING: AssistantSuggestion = { label: '¿Qué pólizas vencen esta semana?', icon: CalendarClock }
const TASK: AssistantSuggestion = { label: 'Creá una tarea para…', icon: ListTodo, fill: 'Creá una tarea para ' }
const CLIENT: AssistantSuggestion = { label: 'Buscá a un asegurado…', icon: Search, fill: 'Mostrame la ficha de ' }
const IDEA: AssistantSuggestion = {
  label: 'Quiero proponer una mejora',
  icon: Lightbulb,
  fill: 'Quiero proponer una mejora: ',
}

/** Suggestions for the screen the person is on; the first match by path prefix wins. */
const BY_SCREEN: Array<[string, AssistantSuggestion[]]> = [
  [
    '/admin/configuracion',
    [
      BANK,
      { label: 'Cambiá el horario de atención de los sábados', icon: Clock, fill: 'Los sábados atendemos de ' },
      { label: '¿Qué datos les da el bot a los clientes?', icon: FileText },
      IDEA,
    ],
  ],
  [
    '/admin/numeros',
    [
      { label: '¿Cuántos mensajes usé este mes en cada número?', icon: Wallet },
      { label: 'Cargá un feriado en mis números', icon: CalendarOff, fill: 'Cargá un feriado el ' },
      BANK,
      PENDING,
    ],
  ],
  [
    '/admin/cobranzas',
    [
      { label: '¿Quiénes tienen cuotas rechazadas?', icon: Wallet },
      { label: '¿Cuánta deuda vencida hay y de quiénes?', icon: Wallet },
      BANK,
      CLIENT,
    ],
  ],
  [
    '/admin/siniestros',
    [
      { label: '¿Qué siniestros siguen sin N° de la compañía?', icon: ShieldAlert },
      { label: '¿Qué siniestros están pendientes?', icon: ShieldAlert },
      CLIENT,
      TASK,
    ],
  ],
  [
    '/admin/solicitudes',
    [
      { label: '¿Qué solicitudes nuevas hay?', icon: FileText },
      { label: 'Resumime las cotizaciones de esta semana', icon: FileText },
      TASK,
      PENDING,
    ],
  ],
  ['/admin/tareas', [{ label: '¿Qué tareas tengo para hoy?', icon: ListTodo }, TASK, PENDING, IDEA]],
  ['/admin/novedades', [{ label: 'Resumime los asuntos por atender', icon: Inbox }, TASK, PENDING, CLIENT]],
  ['/admin/asegurados', [CLIENT, EXPIRING, { label: '¿Quiénes tienen cuotas vencidas?', icon: Wallet }, TASK]],
]

const DEFAULT: AssistantSuggestion[] = [PENDING, BANK, EXPIRING, TASK]

export function suggestionsFor(route: string | undefined): AssistantSuggestion[] {
  return BY_SCREEN.find(([prefix]) => route?.startsWith(prefix))?.[1] ?? DEFAULT
}
