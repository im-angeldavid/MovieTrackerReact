import { useEffect, useState } from 'react'
import { fetchDetail, type MediaKind, type TmdbDetail } from './tmdb'

export type DetailState = {
  detail: TmdbDetail | null
  error: string
  loading: boolean
}

const LOADING: DetailState = { detail: null, error: '', loading: true }

function toMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'Something went wrong.'
}

export function useMediaDetail(kind: MediaKind, id: number) {
  const [state, setState] = useState<DetailState>(LOADING)
  const [key, setKey] = useState({ kind, id })

  // Derive the request key during render so a changed id resets state
  // synchronously, instead of calling setState inside the effect body.
  if (key.kind !== kind || key.id !== id) {
    setKey({ kind, id })
    setState(LOADING)
  }

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    fetchDetail(kind, id, controller.signal).then(
      (detail) => {
        if (active) setState({ detail, error: '', loading: false })
      },
      (cause: unknown) => {
        if (cause instanceof DOMException && cause.name === 'AbortError') return
        if (active) setState({ detail: null, error: toMessage(cause), loading: false })
      },
    )

    return () => {
      active = false
      controller.abort()
    }
  }, [kind, id])

  return state
}