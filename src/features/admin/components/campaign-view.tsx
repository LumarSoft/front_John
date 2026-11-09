'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Info } from 'lucide-react'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import type { CampaignKind } from '@/src/types/api/campaigns'
import { useCampaigns } from '../hooks/use-campaigns'
import { useRole } from '../hooks/use-role'
import { campaignPageByKind } from '../lib/campaign-pages'
import { sendBlockedReason } from '../lib/campaigns-format'
import { CampaignChips, CampaignSwitch } from './campaign-controls'
import { CampaignClientsTab } from './campaign-clients-tab'
import { CampaignMessageTab } from './campaign-message-tab'
import { CampaignResultsTab } from './campaign-results-tab'

type DetailTab = 'clientes' | 'mensaje' | 'resultados'

/** One campaign's page: the portfolio suggests whom to offer something to, the office picks whom to write and follows each one. */
export function CampaignView({ kind }: { kind: CampaignKind }) {
  const { isOwner, isLoading: roleLoading } = useRole()
  const { data, isLoading, isError } = useCampaigns()
  const [tab, setTab] = useState<DetailTab>('clientes')

  const campaign = data?.campaigns.find(c => c.kind === kind) ?? null
  const blocked = campaign ? sendBlockedReason(campaign) : null

  if (!roleLoading && isOwner) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
        <p className="text-[14px] text-muted-foreground">
          Cada organización arma sus campañas. Qué planes las incluyen se elige en{' '}
          <Link href="/admin/funciones" className="font-medium text-ember-2 underline-offset-2 hover:underline">
            Funciones por plan
          </Link>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          <div className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-ember-2">Campañas</div>
          <h1 className="mt-2 font-display text-[clamp(26px,3.5vw,36px)] tracking-[-0.035em] text-ink">
            {campaign?.label ?? campaignPageByKind(kind)?.label}
          </h1>
          {campaign && (
            <>
              <p className="mt-1.5 text-[14px] text-muted-foreground">{campaign.description}</p>
              <div className="mt-3">
                <CampaignChips campaign={campaign} />
              </div>
            </>
          )}
        </div>
        {campaign && <CampaignSwitch campaign={campaign} />}
      </div>

      {isError && <p className="text-[14px] text-destructive">No se pudo cargar la campaña.</p>}
      {isLoading && <Skeleton className="h-[320px] rounded-xl" />}

      {campaign && (
        <>
          {blocked && (
            <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12.5px] text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
              <Info className="mt-0.5 size-4 shrink-0" />
              {blocked}
            </p>
          )}
          <Tabs value={tab} onValueChange={value => setTab(value as DetailTab)} className="mt-4">
            <TabsList>
              <TabsTrigger value="clientes">Clientes</TabsTrigger>
              <TabsTrigger value="mensaje">Mensaje</TabsTrigger>
              <TabsTrigger value="resultados">Resultados</TabsTrigger>
            </TabsList>
            <TabsContent value="clientes" className="mt-4">
              <CampaignClientsTab campaign={campaign} />
            </TabsContent>
            <TabsContent value="mensaje" className="mt-4">
              <CampaignMessageTab key={campaign.updatedAt ?? ''} campaign={campaign} />
            </TabsContent>
            <TabsContent value="resultados" className="mt-4">
              <CampaignResultsTab campaign={campaign} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
