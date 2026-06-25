import { AdminShell } from '@/src/features/admin/components/admin-shell'

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
