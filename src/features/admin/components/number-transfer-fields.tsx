'use client'

import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { cn } from '@/src/lib/utils'
import { TRANSFER_BY_OFFICE, type BotProfile } from '@/src/types/api/config'
import { ACCOUNT_FIELDS, type TransferChoice } from '../lib/number-assistant-form'
import { BOT_PROFILE_GROUPS } from './bot-profile-section'

type AccountField = (typeof ACCOUNT_FIELDS)[number]

const ACCOUNT_SPECS = BOT_PROFILE_GROUPS.flatMap(group => group.fields).filter(field =>
  (ACCOUNT_FIELDS as ReadonlyArray<string>).includes(field.key),
)

const CHOICES: Array<{ value: TransferChoice; label: string }> = [
  { value: 'organization', label: 'La de la organización' },
  { value: 'own', label: 'Cuenta propia' },
  { value: 'office', label: 'No dar datos' },
]

const choiceClasses = (selected: boolean): string =>
  cn(
    'flex-1 rounded-lg border px-3 py-2 text-left text-[13px] transition-colors',
    selected ? 'border-ember bg-ember-soft font-medium text-ink' : 'border-line-2 text-ink-3 hover:border-line-strong',
  )

/** "Alias X · CBU Y · Titular Z", or what the bot says when the organization gives no account. */
function organizationAccount(profile: BotProfile): string {
  const parts = [
    profile.transferAlias && `Alias ${profile.transferAlias}`,
    profile.transferCbu && `CBU ${profile.transferCbu}`,
    profile.transferHolder && `Titular ${profile.transferHolder}`,
    profile.transferBank,
  ].filter(Boolean)
  if (profile.transferMode === TRANSFER_BY_OFFICE || (!profile.transferAlias && !profile.transferCbu)) {
    return 'La organización no da cuenta: el bot dice que la oficina pasa los datos.'
  }
  return parts.join(' · ')
}

interface Props {
  choice: TransferChoice
  account: Record<AccountField, string>
  organization: BotProfile
  onChoice: (choice: TransferChoice) => void
  onAccount: (field: AccountField, value: string) => void
}

/**
 * Which account the bot gives on a number when a customer wants to transfer:
 * the organization's, one of its own (never mixed with the organization's), or
 * none, for a branch that does not hand out an alias: the bot says the office
 * passes the data in the chat and tells the office.
 */
export function NumberTransferFields({ choice, account, organization, onChoice, onAccount }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <Label>Cuenta para transferir</Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        {CHOICES.map(option => (
          <button
            key={option.value}
            type="button"
            aria-pressed={choice === option.value}
            className={choiceClasses(choice === option.value)}
            onClick={() => onChoice(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {choice === 'organization' && (
        <p className="text-[12.5px] text-muted-foreground">
          Usa la de la organización: <span className="text-ink">{organizationAccount(organization)}</span>
        </p>
      )}

      {choice === 'own' && (
        <>
          {ACCOUNT_SPECS.map(field => (
            <div key={field.key} className="flex flex-col gap-2">
              <Label htmlFor={`number-${field.key}`}>{field.label}</Label>
              <Input
                id={`number-${field.key}`}
                maxLength={field.maxLength}
                placeholder={field.placeholder}
                className="h-10"
                value={account[field.key as AccountField]}
                onChange={e => onAccount(field.key as AccountField, e.target.value)}
              />
            </div>
          ))}
          <p className="text-[12px] text-muted-foreground">
            El asistente da solo los datos que cargues acá: nunca los mezcla con los de la organización. Hace falta al
            menos el alias o el CBU.
          </p>
        </>
      )}

      {choice === 'office' && (
        <p className="text-[12.5px] text-muted-foreground">
          El bot no da alias ni CBU en este número. Si un cliente quiere pagar por transferencia, le dice que la oficina
          le pasa los datos por el chat y les avisa en Asuntos pendientes.
        </p>
      )}
    </div>
  )
}
