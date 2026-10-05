import { Link } from 'react-router'
import { posterUrl, releaseYear } from '../lib/tmdb'
import type { MediaKind, TmdbMovie } from '../lib/tmdb'

type MovieCardProps = {
  item: TmdbMovie
  kind: MediaKind
}

function MovieCard({ item, kind }: MovieCardProps) {
  const title = item.title ?? item.name ?? 'Untitled'
  const year = releaseYear(item)
  const poster = posterUrl(item.poster_path)

  return (
    <Link
      to={`/${kind}/${item.id}`}
      className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      <article className="transition-transform duration-300 ease-out active:scale-95 lg:hover:scale-105">
        <div className="overflow-hidden rounded-lg bg-zinc-900">
          {poster ? (
            <img
              src={poster}
              alt={`${title} poster`}
              width={342}
              height={513}
              loading="lazy"
              className="aspect-2/3 w-full object-cover"
            />
          ) : (
            <div className="flex aspect-2/3 w-full items-center justify-center p-2 text-center text-xs text-zinc-500">
              No poster
            </div>
          )}
        </div>

        <h3 className="mt-2 text-xs leading-snug font-medium text-zinc-200 sm:text-sm">
          {title}
        </h3>
        {year && <p className="mt-0.5 text-xs text-zinc-500">{year}</p>}
      </article>
    </Link>
  )
}

export default MovieCard