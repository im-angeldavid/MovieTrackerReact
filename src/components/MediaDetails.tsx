import { isTvShow, posterUrl, releaseYear } from '../lib/tmdb'
import type { TmdbMediaDetails } from '../lib/tmdb'

type MediaDetailsProps = {
  media: TmdbMediaDetails
}

/** Picks the display title for a movie or TV item, falling back to "Untitled" when neither name exists. */
function mediaTitle(media: TmdbMediaDetails): string {
  return media.title ?? media.name ?? 'Untitled'
}

/** Builds the runtime label in "Xh Ym" for movies or the season count for TV shows; returns null when unknown. */
function metaLabel(media: TmdbMediaDetails): string | null {
  if (isTvShow(media)) {
    if (!media.number_of_seasons) return null
    const seasons = media.number_of_seasons
    return `${seasons} season${seasons === 1 ? '' : 's'}`
  }

  if (!media.runtime) return null
  const hours = Math.floor(media.runtime / 60)
  const minutes = media.runtime % 60
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`
}

/** Renders a poster, title and key metadata for a movie or TV show, detecting the type from the TMDB response. */
function MediaDetails({ media }: MediaDetailsProps) {
  const poster = posterUrl(media.poster_path)
  const year = releaseYear(media)
  const isTv = isTvShow(media)
  const meta = metaLabel(media)
  const rating =
    typeof media.vote_average === 'number' && media.vote_average > 0
      ? media.vote_average.toFixed(1)
      : null

  return (
    <article className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
      <div className="grid gap-6 sm:grid-cols-[12rem_1fr] sm:gap-8">
        <div className="overflow-hidden rounded-lg bg-zinc-900">
          {poster ? (
            <img
              src={poster}
              alt={`${mediaTitle(media)} poster`}
              width={342}
              height={513}
              className="aspect-2/3 w-full object-cover"
            />
          ) : (
            <div className="flex aspect-2/3 w-full items-center justify-center p-2 text-center text-xs text-zinc-500">
              No poster
            </div>
          )}
        </div>

        <div>
          <span className="inline-block rounded-full border border-zinc-700 px-2.5 py-0.5 text-xs text-zinc-400">
            {isTv ? 'TV show' : 'Movie'}
          </span>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
            {mediaTitle(media)}
          </h1>

          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-400">
            {year && <span>{year}</span>}
            {meta && <span>{meta}</span>}
            {rating && <span aria-label={`Rating ${rating} out of 10`}>★ {rating}</span>}
          </p>

          {media.overview && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
              {media.overview}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

export default MediaDetails
