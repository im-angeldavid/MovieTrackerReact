import { Link } from 'react-router'
import { posterUrl, releaseYear } from '../lib/tmdb'
import type { MediaKind, TmdbMovie } from '../lib/tmdb'

type MovieCardProps = {
  movie: TmdbMovie
  kind: MediaKind
}

/** Renders a poster card linked to the item's detail route, built from its media kind and TMDB id. */
function MovieCard({ movie, kind }: MovieCardProps) {
  const poster = posterUrl(movie.poster_path)
  const year = releaseYear(movie)
  const title = movie.title ?? movie.name ?? 'Untitled'

  return (
    <Link to={`/${kind}/${movie.id}`} className="group block">
      <div className="overflow-hidden rounded-lg bg-zinc-900">
        {poster ? (
          <img
            src={poster}
            alt={`${title} poster`}
            width={342}
            height={513}
            loading="lazy"
            className="aspect-2/3 w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex aspect-2/3 w-full items-center justify-center p-2 text-center text-xs text-zinc-500">
            No poster
          </div>
        )}
      </div>

      <h3 className="mt-2 text-xs leading-snug font-medium text-zinc-200 group-hover:text-white sm:text-sm">
        {title}
      </h3>
      {year && <p className="mt-0.5 text-xs text-zinc-500">{year}</p>}
    </Link>
  )
}

export default MovieCard
