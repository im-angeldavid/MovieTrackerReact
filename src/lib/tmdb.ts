const API_BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'
const POSTER_SIZE = 'w342'

export type MediaKind = 'movie' | 'tv'

export type TmdbMovie = {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
}

type Dateable = {
  release_date?: string
  first_air_date?: string
}

type Genre = { id: number; name: string }
type CreditPerson = { id: number; name: string; job?: string; jobs?: { job: string }[] }

export type TmdbDetail = Dateable & {
  id: number
  title?: string
  name?: string
  tagline?: string | null
  overview?: string
  runtime?: number | null
  episode_run_time?: number[]
  genres?: Genre[]
  status?: string
  number_of_seasons?: number
  number_of_episodes?: number
  created_by?: { id: number; name: string }[]
  credits?: { crew?: CreditPerson[] }
}

export function mediaId(item: { id?: number; show_id?: number }): number {
  const value = item.id ?? item.show_id
  if (typeof value !== 'number') throw new Error('TMDB item is missing an id')
  return value
}

export function posterUrl(path: string | null | undefined): string | null {
  return path ? `${IMAGE_BASE_URL}/${POSTER_SIZE}${path}` : null
}



export function releaseYear(item: Dateable): string | null {
  const date = item.release_date ?? item.first_air_date
  return date ? date.slice(0, 4) : null
}

export function formatRuntime(detail: TmdbDetail): string | null {
  const minutes = detail.runtime ?? detail.episode_run_time?.[0] ?? null
  if (!minutes) return null
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (!hours) return `${rest}m`
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

export function directorsOf(detail: TmdbDetail): string[] {
  const crew = detail.credits?.crew ?? []
  const movieDirectors = crew
    .filter((person) => person.job === 'Director')
    .map((person) => person.name)

  if (movieDirectors.length) return movieDirectors

  // TV aggregate credits nest jobs in a `jobs` array rather than a `job` string.
  const tvDirectors = crew
    .filter((person) => person.jobs?.some((entry) => entry.job === 'Director'))
    .map((person) => person.name)

  if (tvDirectors.length) return tvDirectors

  // Fall back to the creator when TMDB lists no directors at all.
  return (detail.created_by ?? []).map((person) => person.name)
}

const detailCache = new Map<string, Promise<TmdbDetail>>()

export function clearDetailCache(): void {
  detailCache.clear()
}

function accessToken(): string {
  const token = import.meta.env.VITE_TMDB_ACCESS_TOKEN

  if (!token) {
    throw new Error(
      'Missing VITE_TMDB_ACCESS_TOKEN. Copy .env.example to .env.local and set it, then restart the dev server.',
    )
  }

  return token
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${accessToken()}`, accept: 'application/json' },
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

export async function fetchPopularMovies(signal?: AbortSignal): Promise<TmdbMovie[]> {
  const data = await request<{ results: TmdbMovie[] }>('/movie/popular', signal)
  return data.results
}

export async function fetchPopularShows(signal?: AbortSignal): Promise<TmdbMovie[]> {
  const data = await request<{ results: TmdbMovie[] }>('/tv/popular', signal)
  return data.results
}

export function fetchDetail(kind: MediaKind, id: number, signal?: AbortSignal): Promise<TmdbDetail> {
  const key = `${kind}:${id}`
  const cached = detailCache.get(key)
  if (cached) return cached

  // The cached promise deliberately carries no AbortSignal. Caching a signal
  // bound to the first caller would poison the entry: a StrictMode unmount
  // aborts that request, and every later reader would reuse the rejected
  // promise and hang on the loading state forever.
  const pending = request<TmdbDetail>(`/${kind}/${id}?append_to_response=credits`, signal).catch(
    (cause: unknown) => {
      // Never cache a rejection, otherwise one failure poisons the id forever.
      detailCache.delete(key)
      throw cause
    },
  )

  detailCache.set(key, pending)
  return pending
}