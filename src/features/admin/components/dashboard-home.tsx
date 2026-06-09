'use client'

import { motion } from 'framer-motion'
import { Activity, FileText, Sparkles, TrendingUp, Users, type LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'

interface Metric {
  label: string
  icon: LucideIcon
  hint: string
}

const METRICS: Metric[] = [
  { label: 'Usuarios', icon: Users, hint: 'Administradores activos' },
  { label: 'Cotizaciones', icon: FileText, hint: 'Generadas este mes' },
  { label: 'Actividad', icon: Activity, hint: 'Eventos recientes' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } },
}

export function DashboardHome() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-ember-2">Dashboard</div>
        <h1 className="mt-2 font-display text-[clamp(28px,4vw,40px)] tracking-[-0.035em] text-ink">Hola de nuevo 👋</h1>
        <p className="mt-2 text-[14.5px] text-muted-foreground">
          Este es el panel de control. Pronto vas a encontrar acá las métricas de tu operación.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {METRICS.map(metric => (
          <motion.div key={metric.label} variants={item}>
            <Card className="group relative overflow-hidden border-line-2 shadow-sm transition-shadow duration-300 hover:shadow-[0_18px_50px_-24px_rgba(15,13,10,0.25)]">
              <div className="pointer-events-none absolute -right-6 -top-8 size-24 rounded-full bg-amber-subtle blur-2xl transition-opacity duration-300 group-hover:opacity-80" />
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl border border-amber-border bg-ember-soft text-ember-2">
                  <metric.icon className="size-5" />
                </div>
                <Badge variant="secondary" className="bg-secondary text-muted-foreground">
                  Próximamente
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="font-display text-[30px] leading-none text-ink/35">—</div>
                <div className="mt-2 text-[13px] font-medium text-ink">{metric.label}</div>
                <div className="text-[12px] text-muted-foreground">{metric.hint}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="mt-5"
      >
        <Card className="relative overflow-hidden border-line-2 shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_100%_0%,var(--color-amber-subtle),transparent_55%)]" />
          <CardContent className="relative flex flex-col items-center gap-5 py-16 text-center">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="flex size-16 items-center justify-center rounded-2xl border border-amber-border bg-ember-soft text-ember-2"
            >
              <Sparkles className="size-7" />
            </motion.div>
            <div>
              <h2 className="font-display text-[24px] text-ink">Más métricas en camino</h2>
              <p className="mx-auto mt-2 max-w-[420px] text-[14px] leading-relaxed text-muted-foreground">
                Estamos construyendo gráficos de cotizaciones, actividad de clientes y reportes. Por ahora podés
                gestionar usuarios y tu configuración desde el menú.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[12.5px] font-medium text-ember-2">
              <TrendingUp className="size-4" />
              En desarrollo
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
