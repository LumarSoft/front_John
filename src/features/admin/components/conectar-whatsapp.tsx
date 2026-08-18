'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { Button } from '@/src/components/ui/button'
import { useEmbeddedSignupConfig, useOnboardWhatsapp } from '../hooks/use-whatsapp-onboarding'

/**
 * Launches Meta's Embedded Signup and hands the result to the API.
 *
 * Two channels carry the result and BOTH are needed:
 *   · a postMessage event gives waba_id and phone_number_id
 *   · the FB.login callback gives the exchangeable `code`
 * The message usually lands first, so it is parked in a ref and combined when
 * the callback fires.
 *
 * The code expires 30 SECONDS after the popup closes, so the callback posts it
 * to the backend immediately — no confirmation step in between.
 */

const COEXISTENCE_FEATURE = 'whatsapp_business_app_onboarding'
const SESSION_INFO_VERSION = '3'
const SDK_SRC = 'https://connect.facebook.net/en_US/sdk.js'

interface SessionInfo {
  wabaId?: string
  phoneNumberId?: string
  finished: boolean
}

const waitForSessionInfo = async (session: RefObject<SessionInfo>, timeoutMs = 5_000) => {
  const startedAt = Date.now()
  while (!session.current?.wabaId && Date.now() - startedAt < timeoutMs) {
    await new Promise(resolve => window.setTimeout(resolve, 50))
  }
  return session.current
}

interface FbLoginResponse {
  authResponse?: { code?: string } | null
  status?: string
}

interface FacebookSdk {
  init(options: { appId: string; autoLogAppEvents: boolean; xfbml: boolean; version: string }): void
  login(callback: (response: FbLoginResponse) => void, options: Record<string, unknown>): void
}

declare global {
  interface Window {
    FB?: FacebookSdk
    fbAsyncInit?: () => void
  }
}

interface Props {
  /** Coexistence keeps the number working in the WhatsApp Business app. */
  coexistence?: boolean
  /** Six digits. Ignored by Meta when the number is already registered. */
  pin?: string
  responsibleProducerCodeId?: number
  onConnected?: (metaPhoneNumberId: string) => void
}

export function ConectarWhatsapp({ coexistence = true, pin, responsibleProducerCodeId, onConnected }: Props) {
  const { data: config, isLoading: loadingConfig } = useEmbeddedSignupConfig()
  const onboard = useOnboardWhatsapp()

  const [sdkReady, setSdkReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const session = useRef<SessionInfo>({ finished: false })

  // ── SDK ──
  useEffect(() => {
    if (!config?.ready || !config.appId) return
    let cancelled = false
    const markReady = () => {
      if (!cancelled) setSdkReady(true)
    }

    // Ya cargado por otra pantalla del panel: no hay que reinyectar el script.
    // El aviso se difiere un microtask para no setear estado durante el efecto.
    if (window.FB) {
      void Promise.resolve().then(markReady)
      return () => {
        cancelled = true
      }
    }

    const init = () => {
      window.FB?.init({
        appId: config.appId as string,
        autoLogAppEvents: true,
        xfbml: true,
        version: config.graphVersion,
      })
      markReady()
    }
    window.fbAsyncInit = init

    // Otro montaje ya inyectó el script y su fbAsyncInit todavía no disparó.
    if (document.querySelector<HTMLScriptElement>(`script[src="${SDK_SRC}"]`)) {
      return () => {
        cancelled = true
      }
    }

    const script = document.createElement('script')
    script.src = SDK_SRC
    script.async = true
    script.defer = true
    script.crossOrigin = 'anonymous'
    script.onerror = () => {
      if (!cancelled) setError('No se pudo cargar el SDK de Meta. Revisá si un bloqueador lo está frenando.')
    }
    document.body.appendChild(script)

    return () => {
      cancelled = true
    }
  }, [config])

  // ── postMessage con waba_id / phone_number_id ──
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!/^https:\/\/(www|web)\.facebook\.com$/.test(event.origin)) return
      let payload: { type?: string; event?: string; data?: Record<string, string> }
      try {
        payload = JSON.parse(event.data as string)
      } catch {
        return // Meta also emits non-JSON chatter on this channel
      }
      if (payload.type !== 'WA_EMBEDDED_SIGNUP') return

      if (payload.event === 'CANCEL') {
        setError('Cancelaste el proceso antes de terminar. El número no se conectó.')
        return
      }
      if (payload.event === 'ERROR') {
        setError('Meta reportó un error durante el alta. Volvé a intentarlo.')
        return
      }

      session.current = {
        wabaId: payload.data?.waba_id,
        phoneNumberId: payload.data?.phone_number_id,
        // Coexistence closes with its own event name instead of the usual FINISH.
        finished:
          payload.event === 'FINISH' ||
          payload.event === 'FINISH_ONLY_WABA' ||
          payload.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING',
      }
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const launch = useCallback(() => {
    if (!window.FB || !config?.configId) return
    setError(null)
    session.current = { finished: false }

    window.FB.login(
      response => {
        const code = response?.authResponse?.code
        if (!code) {
          setError('No recibimos el código de Meta. Puede que hayas cerrado la ventana antes de terminar.')
          return
        }

        // The SDK callback and the WA_EMBEDDED_SIGNUP postMessage are separate
        // browser events and either one can arrive first. Wait briefly for the
        // session event so a harmless race does not strand an already-connected
        // number. Coexistence may omit phone_number_id; the API resolves it.
        void waitForSessionInfo(session).then(({ wabaId, phoneNumberId, finished }) => {
          if (!finished || !wabaId || (!coexistence && !phoneNumberId)) {
            setError('Meta no devolvió los datos completos del alta. Repetí el proceso.')
            return
          }

          onboard.mutate(
            {
              code,
              wabaId,
              phoneNumberId,
              isCoexistence: coexistence,
              pin,
              responsibleProducerCodeId,
            },
            {
              onSuccess: result => onConnected?.(result.metaPhoneNumberId),
              onError: (err: Error) => setError(err.message),
            },
          )
        })
      },
      {
        config_id: config.configId,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {},
          ...(coexistence ? { featureType: COEXISTENCE_FEATURE } : {}),
          sessionInfoVersion: SESSION_INFO_VERSION,
        },
      },
    )
  }, [config, coexistence, pin, responsibleProducerCodeId, onboard, onConnected])

  if (loadingConfig) return null

  if (!config?.ready) {
    return (
      <p className="text-sm text-muted-foreground">
        Falta configurar <code>META_APP_ID</code> y <code>META_ES_CONFIG_ID</code> en el servidor para poder conectar
        números de WhatsApp.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={launch} disabled={!sdkReady || onboard.isPending} className="w-fit">
        {onboard.isPending ? 'Conectando…' : 'Conectar número de WhatsApp'}
      </Button>

      {coexistence && (
        <p className="text-xs text-muted-foreground max-w-prose">
          El número sigue funcionando en la app de WhatsApp Business del celular. Meta enviará allí un código de
          verificación para confirmar la conexión.
        </p>
      )}

      {error && <p className="text-sm text-destructive max-w-prose">{error}</p>}

      {onboard.isSuccess && !error && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400 max-w-prose">
          Número conectado y suscripto a los webhooks.
          {!onboard.data.pinSet && ' El PIN de dos pasos no se pudo fijar desde acá — normal en Coexistence.'}
          {coexistence &&
            !onboard.data.historySyncRequested &&
            ' Atención: Meta no aceptó la solicitud de historial; no cierres esta pantalla y revisá los logs.'}
        </p>
      )}
    </div>
  )
}
