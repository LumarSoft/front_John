import { useEffect, useState } from 'react'

/**
 * A preview of a local image as a data URL (null while it is read). Unlike an
 * object URL it needs no revoking, which StrictMode's double effects would do
 * before the image is shown.
 */
export function useImagePreview(file: File): string | null {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => setUrl(typeof reader.result === 'string' ? reader.result : null)
    reader.readAsDataURL(file)
    return () => reader.abort()
  }, [file])

  return url
}
