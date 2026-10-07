const API_BASE_URL = 'https://api.themoviedb.org/3' // TMDB v3 API base URL for all requests.
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p' // TMDB image CDN base URL for poster/backdrop paths.
const POSTER_SIZE = 'w342' // Poster width used for list/card views (mobile-friendly).

export type TmdbMovie = {
  id: number // TMDB identifier for the movie or TV show.
  title?: string // Movie title (present for movie results).
  name?: string // TV show name (present for TV results).
  poster_path: string | null // Relative poster path or null if unavailable.
  release_date?: string // Movie release date in YYYY-MM-DD format.
  first_air_date?: string // TV first air date in YYYY-MM-DD format.
  vote_average?: number // Average vote score from TMDB.
}

export type MediaKind = 'movie' | 'tv' // TMDB media type used for routing and detail fetches.

export type TmdbMediaDetails = TmdbMovie & {
  overview?: string // Short plot summary for the movie or TV show.
  backdrop_path?: string | null // Relative backdrop image path, or null if unavailable.
  runtime?: number // Movie runtime in minutes (movies only).
  number_of_seasons?: number // Total season count (TV shows only).
  seasons?: unknown[] // Season list (TV shows only); also used to detect the media type.
  episodes?: unknown[] // Episode list (TV shows only); also used to detect the media type.
}

type TmdbPopularResponse = {
  page: number // Current page number from the paginated response.
  results: TmdbMovie[] // List of movie or TV show results for this page.
  total_pages: number // Total number of pages available.
  total_results: number // Total number of results matching the query.
}

/** Returns the full poster URL for the given TMDB path, or null if no path exists. */
export function posterUrl(path: string | null): string | null {
  return path ? `${IMAGE_BASE_URL}/${POSTER_SIZE}${path}` : null
}

/** Extracts the four-digit release/year string from a movie or TV item, preferring release_date then first_air_date; returns null if neither exists. */
export function releaseYear(movie: TmdbMovie): string | null {
  const date = movie.release_date ?? movie.first_air_date
  return date ? date.slice(0, 4) : null
}

/** Detects whether a TMDB detail response is a TV show by checking for `seasons`/`episodes` keys, which movie responses never include. */
export function isTvShow(response: unknown): boolean {
  if (typeof response !== 'object' || response === null) return false
  const data = response as Record<string, unknown>
  return 'seasons' in data || 'episodes' in data
}

/** Generic JSON fetcher against TMDB v3 with bearer auth; throws a descriptive error if the token is missing or the response is not OK. */
async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const token = import.meta.env.VITE_TMDB_ACCESS_TOKEN

  if (!token) {
    throw new Error(
      'Missing VITE_TMDB_ACCESS_TOKEN. Copy .env.example to .env.local and set it, then restart the dev server.',
    )
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
    },
    signal,
  })

  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? 'TMDB rejected the access token. Check VITE_TMDB_ACCESS_TOKEN in .env.local.'
        : `TMDB request failed with status ${response.status}.`,
    )
  }

  return (await response.json()) as T
}

/** Fetches the current page of popular movies from TMDB; accepts an optional AbortSignal. */
export async function fetchPopularMovies(signal?: AbortSignal): Promise<TmdbMovie[]> {
  const data = await fetchJson<TmdbPopularResponse>('/movie/popular', signal)
  return data.results
}

/** Fetches the current page of popular TV shows from TMDB; accepts an optional AbortSignal. */
export async function fetchPopularShows(signal?: AbortSignal): Promise<TmdbMovie[]> {
  const data = await fetchJson<TmdbPopularResponse>('/tv/popular', signal)
  return data.results
}

/** Fetches a single movie by its TMDB ID, returning the parsed detail response. */
export async function fetchMovieById(id: number, signal?: AbortSignal): Promise<TmdbMediaDetails> {
  return fetchJson<TmdbMediaDetails>(`/movie/${id}`, signal)
}

/** Fetches a single TV show by its TMDB ID, returning the parsed detail response. */
export async function fetchTvShowById(id: number, signal?: AbortSignal): Promise<TmdbMediaDetails> {
  return fetchJson<TmdbMediaDetails>(`/tv/${id}`, signal)
}

/** Fetches a movie or TV show detail response for the given kind and TMDB ID. */
export async function fetchMediaById(
  kind: MediaKind,
  id: number,
  signal?: AbortSignal,
): Promise<TmdbMediaDetails> {
  return kind === 'tv' ? fetchTvShowById(id, signal) : fetchMovieById(id, signal)
}