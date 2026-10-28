/** Under a setting of the whole organization that the user can read but not change. */
export function SuperAdminOnlyNote() {
  return (
    <p className="text-[12px] text-muted-foreground">
      Es de toda la organización: solo un administrador puede cambiarlo.
    </p>
  )
}
