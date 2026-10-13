'use client'

import { useState } from 'react'
import { FileText, Loader2, SendHorizontal, X } from 'lucide-react'
import { useImagePreview } from '../hooks/use-image-preview'
import { fileSize } from '../lib/inbox-format'

interface Props {
  file: File
  sending: boolean
  onCancel: () => void
  onSend: (caption: string) => void
}

/**
 * Full-panel preview of a photo or PDF before it goes to the customer, like
 * WhatsApp Web: the file in the middle and a caption box with the send button.
 */
export function InboxAttachmentPreview({ file, sending, onCancel, onSend }: Props) {
  const [caption, setCaption] = useState('')
  const preview = useImagePreview(file)
  const isImage = file.type.startsWith('image/')

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !sending) {
      e.preventDefault()
      onSend(caption)
    }
    if (e.key === 'Escape' && !sending) onCancel()
  }

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-(--wa-panel)">
      <div className="flex h-[59px] shrink-0 items-center gap-4 px-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={sending}
          aria-label="Cancelar envío"
          className="rounded-full p-1.5 text-(--wa-icon) hover:bg-black/5 disabled:opacity-40"
        >
          <X className="size-6" />
        </button>
        <span className="truncate text-[16px] text-(--wa-text)">{file.name}</span>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        {isImage ? (
          preview && (
            // A local data URL: nothing for Next's image optimizer to do.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Vista previa de la foto"
              className="max-h-full max-w-full rounded-lg object-contain"
            />
          )
        ) : (
          <div className="flex w-[260px] flex-col items-center gap-3 rounded-xl bg-(--wa-surface) px-6 py-8 text-center shadow-sm">
            <FileText className="size-16 text-[#e2574c]" strokeWidth={1.25} />
            <span className="line-clamp-2 break-all text-[15px] text-(--wa-text)">{file.name}</span>
            <span className="text-[13px] text-(--wa-text-2)">PDF · {fileSize(file.size)}</span>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3 px-[10%] pb-6">
        <input
          autoFocus
          value={caption}
          onChange={e => setCaption(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={1024}
          placeholder="Escribí un mensaje (opcional)"
          className="h-[42px] min-w-0 flex-1 rounded-lg bg-(--wa-surface) px-3 text-[15px] text-(--wa-text) outline-none placeholder:text-(--wa-text-2)"
        />
        <button
          type="button"
          onClick={() => onSend(caption)}
          disabled={sending}
          aria-label="Enviar archivo"
          className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-(--wa-green) text-white shadow-md hover:bg-(--wa-green-dark) disabled:opacity-60"
        >
          {sending ? <Loader2 className="size-6 animate-spin" /> : <SendHorizontal className="size-6" />}
        </button>
      </div>
    </div>
  )
}
