'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { fadeUp, viewport } from '@/src/lib/motion'
import { SectionMark } from '@/src/features/landing/components/section-mark'

type ViewId = 'inbox' | 'asegurados' | 'cobranzas' | 'numeros'

const VIEWS: { id: ViewId; label: string; caption: string }[] = [
  {
    id: 'inbox',
    label: 'Bandeja de entrada',
    caption: 'Todas las conversaciones del número, con el historial completo y el botón para tomar el control.',
  },
  {
    id: 'asegurados',
    label: 'Asegurados',
    caption: 'La cartera sincronizada. Cada asesor ve únicamente los códigos que tiene asignados.',
  },
  {
    id: 'cobranzas',
    label: 'Cobranzas',
    caption: 'Cuotas por vencer, vencidas y pagas, con el detalle de cada póliza.',
  },
  {
    id: 'numeros',
    label: 'Números y consumo',
    caption: 'Consumo real y facturación por número. Vista reservada a la administración.',
  },
]

const SIDEBAR = [
  { id: 'panel', label: 'Panel' },
  { id: 'inbox', label: 'Bandeja de entrada' },
  { id: 'asegurados', label: 'Asegurados' },
  { id: 'cobranzas', label: 'Cobranzas' },
  { id: 'siniestros', label: 'Siniestros' },
  { id: 'solicitudes', label: 'Solicitudes' },
  { id: 'numeros', label: 'Números' },
  { id: 'usuarios', label: 'Usuarios' },
]

export function Panel() {
  const [view, setView] = useState<ViewId>('inbox')
  const active = VIEWS.find(v => v.id === view)!

  return (
    <section id="panel" className="bg-canvas grain border-t border-line">
      <div className="container py-[clamp(64px,10vw,140px)]">
        <div className="mb-10 md:mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[640px]">
            <div className="mb-5 md:mb-6">
              <SectionMark index="03" label="El panel" />
            </div>
            <h2 className="font-display text-[clamp(28px,5.2vw,56px)] leading-[0.98] text-ink m-0">
              Así se ve por <span className="text-ember-2">dentro.</span>
            </h2>
          </div>

          <div className="inline-flex w-full md:w-auto gap-1 bg-paper border border-line rounded-full p-1 overflow-x-auto scrollbar-hide">
            {VIEWS.map(v => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`flex-1 md:flex-none px-3 md:px-4 py-[10px] rounded-full text-[12px] md:text-[12.5px] font-semibold tracking-[-0.005em] transition-colors whitespace-nowrap ${
                  view === v.id ? 'bg-ink text-paper' : 'text-ink-3 hover:text-ink'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <motion.div initial="hidden" whileInView="visible" viewport={viewport} variants={fadeUp}>
          <div className="rounded-2xl md:rounded-3xl overflow-hidden border border-line-2 bg-paper shadow-[0_30px_70px_-40px_rgba(15,13,10,0.35)]">
            {/* barra del navegador */}
            <div className="flex items-center gap-3 border-b border-line bg-canvas-2 px-4 py-3">
              <div className="flex gap-[6px]">
                <span className="h-[9px] w-[9px] rounded-full bg-line-strong/40" />
                <span className="h-[9px] w-[9px] rounded-full bg-line-strong/40" />
                <span className="h-[9px] w-[9px] rounded-full bg-line-strong/40" />
              </div>
              <div className="mx-auto max-w-[320px] flex-1 truncate rounded-full bg-paper px-4 py-[5px] text-center text-[11px] text-faint">
                jpellegrini.ar/admin
              </div>
            </div>

            <div className="flex min-h-[420px] md:min-h-[520px]">
              {/* sidebar */}
              <aside className="hidden w-[188px] shrink-0 flex-col border-r border-line bg-canvas-2 p-3 md:flex">
                <div className="px-3 py-3 font-display text-[13px] tracking-[-0.02em] text-ink">JPMG · Admin</div>
                <nav className="mt-2 flex flex-col gap-[2px]">
                  {SIDEBAR.map(item => (
                    <span
                      key={item.id}
                      className={`rounded-lg px-3 py-[9px] text-[12.5px] ${
                        item.id === view ? 'bg-ink text-paper font-semibold' : 'text-ink-3'
                      }`}
                    >
                      {item.label}
                    </span>
                  ))}
                </nav>
                <div className="mt-auto rounded-xl border border-line bg-paper p-3">
                  <div className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-faint">Sesión</div>
                  <div className="mt-1 text-[12px] font-semibold text-ink">Casa Central</div>
                  <div className="text-[11px] text-faint">Administrador</div>
                </div>
              </aside>

              <div className="min-w-0 flex-1 bg-paper">
                {view === 'inbox' && <InboxView />}
                {view === 'asegurados' && <AseguradosView />}
                {view === 'cobranzas' && <CobranzasView />}
                {view === 'numeros' && <NumerosView />}
              </div>
            </div>
          </div>

          <p className="mt-5 text-[13.5px] leading-[1.6] text-ink-3 m-0 max-w-[720px]">{active.caption}</p>
        </motion.div>
      </div>
    </section>
  )
}

/* ---------- vistas ---------- */

const CONVERSACIONES = [
  { name: 'Martín Ferreyra', last: 'Perfecto, muchas gracias!', time: '10:42', unread: 0, active: true },
  { name: 'Carla Domínguez', last: 'Necesito denunciar un siniestro', time: '10:15', unread: 2, active: false },
  { name: 'Rubén Salas', last: 'Cuándo vence la cuota de febrero?', time: '09:58', unread: 0, active: false },
  { name: 'Lucía Antonelli', last: 'Quiero cotizar una moto 150cc', time: 'Ayer', unread: 0, active: false },
]

function InboxView() {
  return (
    <div className="flex h-full">
      <div className="hidden w-[220px] shrink-0 flex-col border-r border-line lg:flex">
        <div className="border-b border-line px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">
          Conversaciones
        </div>
        {CONVERSACIONES.map(c => (
          <div key={c.name} className={`border-b border-line px-4 py-3 ${c.active ? 'bg-ember-soft' : ''}`}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-[12.5px] font-semibold text-ink">{c.name}</span>
              <span className="shrink-0 text-[10px] text-faint">{c.time}</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="truncate text-[11.5px] text-faint">{c.last}</span>
              {c.unread > 0 && (
                <span className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-ember text-[9px] font-bold text-ink">
                  {c.unread}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-6">
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-semibold text-ink">Martín Ferreyra</div>
            <div className="text-[11px] text-faint">+54 9 341 555-0142 · Cliente identificado · Código 10484</div>
          </div>
          <span className="shrink-0 rounded-full bg-ink px-3 py-[7px] text-[11px] font-semibold text-paper">
            Tomar conversación
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 bg-canvas-2 p-4 md:p-6">
          <Msg who="cliente">Hola! Necesito el comprobante de mi póliza del auto</Msg>
          <Msg who="bot">Hola! Soy Nico, el asistente de John Pellegrini. Me pasás tu DNI así te busco?</Msg>
          <Msg who="cliente">30111222</Msg>
          <Msg who="bot">
            Listo Martín. Tenés 2 pólizas activas: Automotor (VW Gol Trend) y Hogar (Blvd. Oroño 1200). De cuál querés
            el comprobante?
          </Msg>
          <Msg who="cliente">La del auto</Msg>
          <Msg who="bot">Te lo mando ahora. Póliza 4471-092331, vigente hasta el 30/11/2026.</Msg>
          <Msg who="cliente">Perfecto, muchas gracias!</Msg>
        </div>

        <div className="border-t border-line px-4 py-3 md:px-6">
          <div className="flex items-center gap-3 rounded-full border border-line bg-canvas-2 px-4 py-[10px]">
            <span className="text-[12.5px] text-faint">Escribí para responder como asesor…</span>
            <span className="ml-auto rounded-full bg-ember px-4 py-[5px] text-[11px] font-semibold text-ink">
              Enviar
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Msg({ who, children }: { who: 'cliente' | 'bot'; children: React.ReactNode }) {
  const isBot = who === 'bot'
  return (
    <div className={`flex ${isBot ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[78%]">
        <div
          className={`rounded-2xl px-3 py-2 text-[12.5px] leading-[1.5] ${
            isBot ? 'rounded-br-sm bg-ink text-paper' : 'rounded-bl-sm bg-paper text-ink border border-line'
          }`}
        >
          {children}
        </div>
        <div className={`mt-1 text-[9.5px] uppercase tracking-[0.16em] text-faint ${isBot ? 'text-right' : ''}`}>
          {isBot ? 'Nico · asistente' : 'Asegurado'}
        </div>
      </div>
    </div>
  )
}

const ASEGURADOS = [
  ['Ferreyra, Martín', '30.111.222', 'Automotor · Hogar', '10484', 'Al día'],
  ['Domínguez, Carla', '28.904.117', 'Automotor', '10484', 'Al día'],
  ['Salas, Rubén', '24.556.031', 'Comercio', '14831', 'Cuota vencida'],
  ['Antonelli, Lucía', '35.220.884', 'Motovehículo', '10484', 'Al día'],
  ['Brizuela, Hernán', '27.118.640', 'Automotor · Vida', '14831', 'Al día'],
]

function AseguradosView() {
  return (
    <div className="p-4 md:p-6">
      <ViewHeader
        title="Asegurados"
        sub="1.842 registros sincronizados"
        chips={['Todos los códigos', 'Con cuota vencida', 'Alta este mes']}
      />
      <Table head={['Asegurado', 'DNI', 'Pólizas', 'Código', 'Estado']} rows={ASEGURADOS} badgeCol={4} />
    </div>
  )
}

const COBRANZAS = [
  ['Salas, Rubén', '4471-088120', 'Enero 2026', '$ 84.300', 'Vencida'],
  ['Ferreyra, Martín', '4471-092331', 'Febrero 2026', '$ 61.750', 'Por vencer'],
  ['Antonelli, Lucía', '4471-093004', 'Febrero 2026', '$ 38.900', 'Por vencer'],
  ['Domínguez, Carla', '4471-090877', 'Enero 2026', '$ 72.400', 'Paga'],
  ['Brizuela, Hernán', '4471-089455', 'Enero 2026', '$ 95.100', 'Paga'],
]

function CobranzasView() {
  return (
    <div className="p-4 md:p-6">
      <ViewHeader title="Cobranzas" sub="Cuotas del período en curso" chips={['Vencidas', 'Por vencer', 'Pagas']} />
      <Table head={['Asegurado', 'Póliza', 'Período', 'Importe', 'Estado']} rows={COBRANZAS} badgeCol={4} />
    </div>
  )
}

const NUMEROS = [
  { label: 'Consumo real del mes', value: 'USD 3,42', sub: 'Modelo de lenguaje + mensajería' },
  { label: 'Facturado a la productora', value: 'USD 50,00', sub: 'Abono mensual del servicio' },
  { label: 'Conversaciones atendidas', value: '1.284', sub: 'Últimos 30 días' },
  { label: 'Resueltas sin asesor', value: '87 %', sub: 'Sin intervención humana' },
]

function NumerosView() {
  return (
    <div className="p-4 md:p-6">
      <ViewHeader
        title="Números"
        sub="Consumo y facturación por número de WhatsApp"
        chips={['Este mes', 'Histórico']}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line-2 rounded-2xl overflow-hidden border border-line-2">
        {NUMEROS.map(n => (
          <div key={n.label} className="bg-paper p-4 md:p-5">
            <div className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-faint">{n.label}</div>
            <div className="font-display text-[clamp(20px,2.6vw,30px)] leading-none text-ink mt-3">{n.value}</div>
            <div className="text-[11px] text-faint mt-2 leading-[1.4]">{n.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-canvas-2 p-4 md:p-5">
        <div className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-faint">Número conectado</div>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] text-ink-3">
          <span className="font-semibold text-ink">+54 9 341 275-7294</span>
          <span>Casa Central · Rosario</span>
          <span>Códigos servidos: 10484, 14831</span>
          <span className="rounded-full bg-ember-soft px-3 py-[4px] text-[11px] font-semibold text-ember-2">
            Activo
          </span>
        </div>
      </div>
    </div>
  )
}

/* ---------- primitivas ---------- */

function ViewHeader({ title, sub, chips }: { title: string; sub: string; chips: string[] }) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h3 className="font-display text-[20px] leading-none text-ink m-0">{title}</h3>
        <p className="mt-2 text-[12px] text-faint m-0">{sub}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip, i) => (
          <span
            key={chip}
            className={`rounded-full px-3 py-[6px] text-[11px] font-medium ${
              i === 0 ? 'bg-ink text-paper' : 'border border-line text-ink-3'
            }`}
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  )
}

function Table({ head, rows, badgeCol }: { head: string[]; rows: string[][]; badgeCol: number }) {
  const tone = (value: string) =>
    value === 'Vencida' || value === 'Cuota vencida'
      ? 'bg-destructive/10 text-destructive'
      : value === 'Paga' || value === 'Al día'
        ? 'bg-ember-soft text-ember-2'
        : 'bg-canvas-3 text-ink-3'

  return (
    <div className="overflow-x-auto rounded-2xl border border-line-2">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-canvas-2">
            {head.map(h => (
              <th
                key={h}
                className="whitespace-nowrap px-4 py-3 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-faint"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row[0]} className="border-t border-line">
              {row.map((cell, i) => (
                <td key={i} className="whitespace-nowrap px-4 py-[13px] text-[12.5px] text-ink-3">
                  {i === badgeCol ? (
                    <span className={`rounded-full px-[10px] py-[4px] text-[11px] font-semibold ${tone(cell)}`}>
                      {cell}
                    </span>
                  ) : i === 0 ? (
                    <span className="font-semibold text-ink">{cell}</span>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
