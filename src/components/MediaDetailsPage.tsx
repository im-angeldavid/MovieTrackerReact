import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { fetchMediaById } from '../lib/tmdb'
import type { MediaKind, TmdbMediaDetails } from '../lib/tmdb'
import MediaDetails from './MediaDetails'

type Status = 'loading' | 'ready' | 'error'

type MediaDetailsPageProps = {
  kind: MediaKind
}

/** Fetches a movie or TV show using the :id route param and renders its details, handling loading and error states. */
function MediaDetailsPage({ kind }: MediaDetailsPageProps) {
  const { id } = useParams()
  const numericId = Number(id)
  const isValidId = Number.isFinite(numericId)
  const [media, setMedia] = useState<TmdbMediaDetails | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isValidId) return

    const controller = new AbortController()

    fetchMediaById(kind, numericId, controller.signal)
      .then((result) => {
        setMedia(result)
        setStatus('ready')
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === 'AbortError') return
        setError(cause instanceof Error ? cause.message : 'Something went wrong.')
        setStatus('error')
      })

    return () => controller.abort()
  }, [kind, numericId, isValidId])

  if (!isValidId) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <p className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          Invalid media id.
        </p>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="grid gap-6 sm:grid-cols-[12rem_1fr] sm:gap-8">
          <div className="aspect-2/3 animate-pulse rounded-lg bg-zinc-900" />
          <div className="space-y-3">
            <div className="h-6 w-24 animate-pulse rounded bg-zinc-900" />
            <div className="h-10 w-2/3 animate-pulse rounded bg-zinc-900" />
            <div className="h-24 w-full animate-pulse rounded bg-zinc-900" />
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error' || !media) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <p className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error || 'Something went wrong.'}
        </p>
      </div>
    )
  }

  return <MediaDetails media={media} />
}

export default MediaDetailsPage
