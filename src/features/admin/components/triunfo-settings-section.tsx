'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Skeleton } from '@/src/components/ui/skeleton'
import { useSaveTriunfoCredential, useTriunfoCredential } from '../hooks/use-triunfo-credential'
import { SuperAdminOnlyNote } from './super-admin-only-note'
import { TriunfoCredentialForm, TriunfoCredentialStatusView } from './triunfo-credential-form'

/**
 * The organization's own Triunfo web-service access, loaded by its SuperAdmin:
 * nobody else has to be told the password, and it is hashed in the browser.
 */
export function TriunfoSettingsSection({ canEdit }: { canEdit: boolean }) {
  const { data: status, isLoading, isError } = useTriunfoCredential(canEdit)
  const save = useSaveTriunfoCredential()

  return (
    <Card className="max-w-3xl border-line-2 shadow-sm">
      <CardHeader>
        <CardTitle className="font-display text-[18px]">Acceso a Triunfo</CardTitle>
        <CardDescription>
          El usuario con el que se cotiza, se sincroniza la cartera y se bajan los documentos de tu organización.
          Cargalo vos: nadie más necesita conocer la contraseña. Si la cambiás en TriunfoNet, cargá la nueva acá.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {!canEdit && <SuperAdminOnlyNote />}
        {canEdit && isLoading && <Skeleton className="h-32" />}
        {canEdit && isError && <p className="text-[14px] text-destructive">No se pudo cargar el acceso a Triunfo.</p>}
        {canEdit && status && (
          <>
            <TriunfoCredentialStatusView status={status} audience="office" />
            <TriunfoCredentialForm status={status} save={save} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
