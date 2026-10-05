import { Link, useParams } from 'react-router'
import { useMediaDetail } from '../lib/useMediaDetail'
import { directorsOf } from '../lib/tmdb'
import type { MediaKind } from '../lib/tmdb'
import DetailMeta from '../components/DetailMeta'

function parseKind(value: string | undefined): MediaKind {
  return value === 'tv' ? 'tv' : 'movie'
}

function NotFound() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Not found</h1>
      <p className="mt-2 text-sm text-zinc-400">That title does not exist.</p>
      <Link to="/" className="mt-6 inline-block text-sm text-amber-400 hover:text-amber-300">
        Back to search
      </Link>
    </section>
  )
}

export default function MediaDetailPage() {
  const params = useParams<{ kind: string; id: string }>()
  const kind = parseKind(params.kind)
  const id = Number(params.id)
  const valid = Number.isInteger(id) && id > 0

  // Split so an invalid id never reaches the hook: it would otherwise be called
  // unconditionally and fire a request for id 0 before the guard below renders.
  if (!valid) return <NotFound />
  return <MediaDetail kind={kind} id={id} />
}

function MediaDetail({ kind, id }: { kind: MediaKind; id: number }) {
  const { detail, error, loading } = useMediaDetail(kind, id)

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-900" />
        <div className="mt-4 h-10 w-2/3 animate-pulse rounded bg-zinc-900" />
        <div className="mt-6 h-40 w-full animate-pulse rounded bg-zinc-900" />
      </section>
    )
  }

  if (error || !detail) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16">
        <p className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error || 'Something went wrong.'}
        </p>
        <Link to="/" className="mt-6 inline-block text-sm text-amber-400 hover:text-amber-300">
          Back to search
        </Link>
      </section>
    )
  }

  const title = detail.title ?? detail.name ?? 'Untitled'
  const directors = directorsOf(detail)

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <Link to="/" className="text-sm text-zinc-400 hover:text-zinc-100">
        &larr; Back
      </Link>

      <header className="mt-6">
        {detail.tagline && (
          <p className="text-sm text-zinc-500 italic">{detail.tagline}</p>
        )}
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-balance sm:text-5xl">{title}</h1>
        <div className="mt-4">
          <DetailMeta detail={detail} />
        </div>
      </header>

      <section className="mt-8">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-300 uppercase">Overview</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          {detail.overview || 'No overview available.'}
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-300 uppercase">
          {kind === 'tv' ? 'Created by' : 'Directed by'}
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          {directors.length ? directors.join(', ') : 'Not available.'}
        </p>
      </section>
    </article>
  )
}