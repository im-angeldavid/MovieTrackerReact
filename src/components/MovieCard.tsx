import { posterUrl, releaseYear } from '../lib/tmdb'
import type { TmdbMovie } from '../lib/tmdb'

type MovieCardProps = {
  movie: TmdbMovie
}

function MovieCard({ movie }: MovieCardProps) {
  const poster = posterUrl(movie.poster_path)
  const year = releaseYear(movie)
  const title = movie.title ?? (movie as TmdbMovie & { name?: string }).name ?? 'Untitled'

  return (
    <article className="group">
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

      <h3 className="mt-2 text-xs leading-snug font-medium text-zinc-200 sm:text-sm">
        {title}
      </h3>
      {year && <p className="mt-0.5 text-xs text-zinc-500">{year}</p>}
    </article>
  )
}

export default MovieCard