import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mi portal · John Pellegrini & Asoc.',
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <p className="text-muted text-[14px]">Dashboard — próximamente</p>
    </div>
  )
}
