import { Clock3, Film } from 'lucide-react'
import { formatRuntime, releaseYear } from '../lib/tmdb'
import type { TmdbDetail } from '../lib/tmdb'

type DetailMetaProps = {
  detail: TmdbDetail
}

function DetailMeta({ detail }: DetailMetaProps) {
  const year = releaseYear(detail)
  const runtime = formatRuntime(detail)

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400 sm:text-sm">
      {year && <span>{year}</span>}
      {runtime && (
        <span className="inline-flex items-center gap-1">
          <Clock3 aria-hidden="true" className="size-3.5" />
          {runtime}
        </span>
      )}
      {detail.status && <span>{detail.status}</span>}
      {detail.genres?.map((genre) => (
        <span
          key={genre.id}
          className="rounded-full border border-zinc-800 px-2 py-0.5 text-zinc-300"
        >
          {genre.name}
        </span>
      ))}
      <span className="inline-flex items-center gap-1">
        <Film aria-hidden="true" className="size-3.5" />
        TMDB
      </span>
    </div>
  )
}

export default DetailMeta