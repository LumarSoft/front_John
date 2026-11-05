/**
 * "Mostrame en pantalla": short guides the AI assistant offers after
 * explaining a task. Each one goes to its screen, rings the REAL element and
 * says what to do there, at most three steps.
 *
 * Steps point at `data-help="…"` attributes on the real elements (never at CSS
 * classes, which change with every restyle). When several elements share an
 * anchor (every row of a list), the first visible one is used. To move a guide
 * to another button, move the attribute.
 *
 *   target   — the element to ring.
 *   text     — what to do there, in a line or two.
 *   waitFor  — the element whose click moves on (often the target itself).
 *              Without it the bubble shows "Siguiente" / "Listo".
 *   missing  — what to say when the element is not on screen (an empty list).
 *
 * Inside a dialog or a side sheet every step but the last needs `waitFor`:
 * tapping "Siguiente" in the bubble counts as a click outside and closes it.
 *
 * The ids are the API's (api_john src/assistant/panel-guide.ts, PANEL_TOURS):
 * the assistant only links the ones listed there. A tour added here is
 * offered once it is added there too.
 */
export interface TourStep {
  target: string
  text: string
  waitFor?: string
  missing?: string
}

export interface Tour {
  /** Screen the guide runs on; without it, it runs wherever the person is. */
  route?: string
  steps: [TourStep] | [TourStep, TourStep] | [TourStep, TourStep, TourStep]
}

const OPEN_CHAT: TourStep = {
  target: 'chat-item',
  text: 'Tocá el chat del cliente. Arriba podés buscarlo por nombre, DNI o teléfono.',
  waitFor: 'chat-item',
  missing: 'Todavía no hay chats en esta lista. Si filtraste, volvé a «Todos».',
}

export const TOURS = {
  'cargar-rechazos': {
    route: '/admin/rechazos',
    steps: [
      {
        target: 'rechazos-cargar',
        text: 'Tocá «Cargar Excel» y elegí el archivo de débitos rechazados que bajaste de Triunfo (el de CBU o el de tarjetas).',
      },
      {
        target: 'rechazos-carga',
        text: 'Cada Excel cargado queda acá. Las filas «Para enviar» ya vienen tildadas: tocá «Enviar avisos» y el bot le escribe a cada cliente, o «Marcar como avisados a mano» si ya les avisaste.',
        missing:
          'Todavía no cargaste ningún Excel. Cuando cargues el primero, acá aparecen sus filas y el botón «Enviar avisos».',
      },
    ],
  },
  'nueva-tarea': {
    route: '/admin/tareas',
    steps: [
      { target: 'tareas-nueva', text: 'Tocá «Nueva tarea».', waitFor: 'tareas-nueva' },
      {
        target: 'tarea-form',
        text: 'Elegí para quién es, escribí qué hay que hacer y para cuándo. Si viene de un llamado, cargá quién llamó. Después tocá «Crear tarea».',
        waitFor: 'tarea-crear',
      },
    ],
  },
  'escribir-cliente': {
    route: '/admin/inbox',
    steps: [
      OPEN_CHAT,
      {
        target: 'chat-tomar',
        text: 'Tocá «Tomar» (o «Tomar la conversación para escribir», abajo). Desde ahí el bot deja de responder en este chat y escribís vos.',
        waitFor: 'chat-tomar',
        missing: 'Este chat ya lo atiende la oficina (o el bot está apagado en el número): escribí directamente abajo.',
      },
      {
        target: 'chat-escribir',
        text: 'Escribí acá y mandalo con la flecha. Con el clip adjuntás fotos o PDF. Cuando termines, devolvé el chat al bot desde el menú ⋮.',
      },
    ],
  },
  'devolver-al-bot': {
    route: '/admin/inbox',
    steps: [
      { ...OPEN_CHAT, text: 'Tocá el chat que querés devolverle al bot.' },
      { target: 'chat-menu', text: 'Tocá los tres puntos ⋮ de arriba.', waitFor: 'chat-menu' },
      {
        target: 'chat-devolver',
        text: 'Tocá «Devolver al bot». Desde ahí el bot vuelve a responder en este chat.',
        waitFor: 'chat-devolver',
        missing: 'Este chat no está tomado: el bot ya lo está atendiendo.',
      },
    ],
  },
  'estado-asunto': {
    route: '/admin/novedades',
    steps: [
      {
        target: 'asunto-estado',
        text: 'Cambiá el estado acá: «En atención» mientras lo ves y «Resuelto» cuando terminaste. Leer el chat no lo resuelve.',
        missing: 'No hay asuntos por atender en esta lista. Para ver los anteriores, elegí «Todos los estados».',
      },
    ],
  },
  'gestionar-siniestro': {
    route: '/admin/siniestros',
    steps: [
      {
        target: 'siniestro-fila',
        text: 'Tocá el siniestro que querés gestionar.',
        waitFor: 'siniestro-fila',
        missing: 'No hay siniestros en esta lista. Para ver todos, elegí «Todos» en los filtros.',
      },
      {
        target: 'siniestro-gestion',
        text: 'Elegí el estado y, cuando lo presentaste en Triunfo, cargá el N° de siniestro de la compañía. Después tocá «Guardar cambios».',
        waitFor: 'siniestro-guardar',
      },
    ],
  },
  'documentos-asegurado': {
    route: '/admin/asegurados',
    steps: [
      { target: 'asegurados-buscar', text: 'Buscá al asegurado por nombre, DNI, email o patente.' },
      {
        target: 'asegurado-fila',
        text: 'Tocá el asegurado para abrir su ficha.',
        waitFor: 'asegurado-fila',
        missing: 'No encontré asegurados con esa búsqueda. Probá con el DNI o la patente.',
      },
      {
        target: 'asegurado-documentos',
        text: 'Abrí «Documentos». En «Triunfo» están los de cada póliza con «Descargar»; las credenciales y los certificados se arman acá.',
        waitFor: 'asegurado-documentos',
      },
    ],
  },
  'recordar-pago': {
    route: '/admin/cobranzas',
    steps: [
      {
        target: 'cobranza-whatsapp',
        text: 'Este botón abre tu WhatsApp con el recordatorio de pago ya armado: revisalo y mandalo desde ahí. No sale por la bandeja del panel.',
        missing: 'No hay cuotas vencidas en esta lista (o el cliente no tiene teléfono cargado).',
      },
    ],
  },
  'avisar-vencidas': {
    route: '/admin/cobranzas',
    steps: [
      { target: 'cobranzas-vencidas', text: 'Tocá «Pólizas vencidas».', waitFor: 'cobranzas-vencidas' },
      {
        target: 'vencidas-tildar',
        text: 'Tildá las pólizas a las que querés avisar. La casilla de arriba elige toda la página.',
        missing: 'No hay pólizas vencidas sin renovar para avisar.',
      },
      {
        target: 'vencidas-enviar',
        text: 'Tocá «Enviar aviso»: sale desde el número con el que el cliente habla con la oficina. Si ya les avisaste por otro lado, usá «Avisados a mano».',
      },
    ],
  },
  'estado-solicitud': {
    route: '/admin/solicitudes',
    steps: [
      {
        target: 'solicitud-fila',
        text: 'Tocá la solicitud.',
        waitFor: 'solicitud-fila',
        missing: 'No hay solicitudes en esta lista. Probá con la pestaña «Todas».',
      },
      {
        target: 'solicitud-gestion',
        text: 'Elegí el estado (Nueva, Contactada o Cerrada), anotá el seguimiento en «Notas internas» y tocá «Guardar cambios».',
        waitFor: 'solicitud-guardar',
      },
    ],
  },
  'proponer-mejora': {
    route: '/admin/mejoras',
    steps: [
      { target: 'mejoras-propuestas', text: 'Tocá «Propuestas».', waitFor: 'mejoras-propuestas' },
      {
        target: 'propuesta-form',
        text: 'Escribí qué te gustaría que cambie y contá el detalle (qué pasa hoy y un ejemplo). Después tocá «Enviar propuesta»: la ve todo el equipo.',
        waitFor: 'propuesta-enviar',
      },
    ],
  },
  apariencia: {
    steps: [
      {
        target: 'usuario-menu',
        text: 'Tocá tu correo, abajo a la izquierda.',
        waitFor: 'usuario-menu',
        missing: 'Abrí el menú (☰ arriba a la izquierda) y tocá tu correo, abajo de todo.',
      },
      { target: 'usuario-apariencia', text: 'Tocá «Apariencia».', waitFor: 'usuario-apariencia' },
      {
        target: 'apariencia-opciones',
        text: 'Elegí el modo (Claro, Oscuro o Automático) y los colores. Se aplica al instante y queda guardado en este navegador.',
      },
    ],
  },
  'bot-en-un-numero': {
    route: '/admin/numeros',
    steps: [
      {
        target: 'numero-asistente',
        text: 'Tocá «Asistente» en el número que querés cambiar.',
        waitFor: 'numero-asistente',
        missing: 'No hay números cargados todavía.',
      },
      {
        target: 'numero-bot',
        text: 'Acá apagás o prendés el bot solo en este número. Apagado, la oficina contesta desde Whatsapp sin tomar cada chat; los demás números siguen igual.',
      },
    ],
  },
  horarios: {
    route: '/admin/configuracion',
    steps: [
      { target: 'config-horarios', text: 'Tocá «Horarios».', waitFor: 'config-horarios' },
      {
        target: 'horarios-form',
        text: 'Cargá el horario de cada día (hasta dos turnos) y tocá «Guardar horarios». Los feriados y pausas se cargan en cada número.',
      },
    ],
  },
} satisfies Record<string, Tour>

export type TourId = keyof typeof TOURS

export function isTourId(id: string): id is TourId {
  return Object.hasOwn(TOURS, id)
}

export function getTour(id: TourId): Tour {
  return TOURS[id]
}
