'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import type { CampaignKind } from '@/src/types/api/campaigns'
import { useCampaigns } from '../hooks/use-campaigns'
import { useRole } from '../hooks/use-role'
import { sendBlockedReason } from '../lib/campaigns-format'
import { CampaignCard } from './campaign-card'
import { CampaignClientsTab } from './campaign-clients-tab'
import { CampaignMessageTab } from './campaign-message-tab'

type DetailTab = 'clientes' | 'mensaje'

/** "Campañas": the portfolio suggests whom to offer something to, and the office picks whom to write. */
export function CampaignsView() {
  const { isOwner, isLoading: roleLoading } = useRole()
  const { data, isLoading, isError } = useCampaigns()
  const [selectedKind, setSelectedKind] = useState<CampaignKind | null>(null)
  const [tab, setTab] = useState<DetailTab>('clientes')

  const campaigns = data?.campaigns ?? []
  const selected = campaigns.find(c => c.kind === selectedKind) ?? campaigns[0] ?? null
  const blocked = selected ? sendBlockedReason(selected) : null

  if (!roleLoading && isOwner) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
        <p className="text-[14px] text-muted-foreground">
          Cada organización arma sus campañas. Qué planes las incluyen se elige en Facturación → Planes.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
      <div className="mb-6">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-ember-2">Ventas</div>
        <h1 className="mt-2 font-display text-[clamp(26px,3.5vw,36px)] tracking-[-0.035em] text-ink">Campañas</h1>
        <p className="mt-1.5 max-w-2xl text-[14px] text-muted-foreground">
          El sistema busca en la cartera a quién ofrecerle algo y la oficina elige a quién escribirle por WhatsApp.
        </p>
      </div>

      {isError && <p className="text-[14px] text-destructive">No se pudieron cargar las campañas.</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[132px] rounded-xl" />)}
        {campaigns.map(campaign => (
          <CampaignCard
            key={campaign.kind}
            campaign={campaign}
            selected={selected?.kind === campaign.kind}
            onSelect={() => setSelectedKind(campaign.kind)}
          />
        ))}
      </div>

      {selected && (
        <section className="mt-8">
          <h2 className="font-display text-[22px] tracking-[-0.02em] text-ink">{selected.label}</h2>
          {blocked && (
            <p className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12.5px] text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
              <Info className="mt-0.5 size-4 shrink-0" />
              {blocked}
            </p>
          )}
          <Tabs value={tab} onValueChange={value => setTab(value as DetailTab)} className="mt-4">
            <TabsList>
              <TabsTrigger value="clientes">Clientes</TabsTrigger>
              <TabsTrigger value="mensaje">Mensaje</TabsTrigger>
            </TabsList>
            <TabsContent value="clientes" className="mt-4">
              <CampaignClientsTab key={selected.kind} campaign={selected} />
            </TabsContent>
            <TabsContent value="mensaje" className="mt-4">
              <CampaignMessageTab key={`${selected.kind}:${selected.updatedAt ?? ''}`} campaign={selected} />
            </TabsContent>
          </Tabs>
        </section>
      )}
    </div>
  )
}
