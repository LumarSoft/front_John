'use client'

import { Lightbulb, Loader2, Sparkles } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { MejorasEditorView } from '@/src/features/admin/components/mejoras-editor-view'
import { MejorasView } from '@/src/features/admin/components/mejoras-view'
import { OwnerProposalsView } from '@/src/features/admin/components/owner-proposals-view'
import { ProposalsBoard } from '@/src/features/admin/components/proposals-board'
import { useNewProposalsCount } from '@/src/features/admin/hooks/use-proposals'
import { useRole } from '@/src/features/admin/hooks/use-role'

export default function MejorasPage() {
  const { isOwner, isLoading } = useRole()
  const { data: newProposals } = useNewProposalsCount(isOwner)

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-4 flex items-center gap-2 font-display text-[22px] tracking-tight text-ink">
        <Sparkles className="size-5 text-ember-2" />
        Mejoras
      </h1>
      <Tabs defaultValue="mejoras">
        <TabsList variant="line" className="h-auto justify-start gap-1">
          <TabsTrigger value="mejoras" className="gap-1.5 px-3 py-1.5 text-[13.5px]">
            <Sparkles className="size-4" /> Mejoras
          </TabsTrigger>
          <TabsTrigger value="propuestas" className="gap-1.5 px-3 py-1.5 text-[13.5px]">
            <Lightbulb className="size-4" /> Propuestas
            {isOwner && !!newProposals?.count && (
              <span className="rounded-full bg-ember-2 px-1.5 text-[10.5px] font-semibold text-on-dark">
                {newProposals.count}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        {/* Lumar writes and answers; everyone else reads and proposes. */}
        <TabsContent value="mejoras" className="mt-5">
          {isOwner ? <MejorasEditorView /> : <MejorasView />}
        </TabsContent>
        <TabsContent value="propuestas" className="mt-5">
          {isOwner ? <OwnerProposalsView /> : <ProposalsBoard />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
