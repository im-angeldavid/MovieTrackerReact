const API_BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'
const POSTER_SIZE = 'w342'

export type TmdbMovie = {
  id: number
  title: string
  poster_path: string | null
  release_date?: string
  vote_average?: number
}

type TmdbPopularResponse = {
  page: number
  results: TmdbMovie[]
  total_pages: number
  total_results: number
}

export function posterUrl(path: string | null): string | null {
  return path ? `${IMAGE_BASE_URL}/${POSTER_SIZE}${path}` : null
}

export function releaseYear(movie: TmdbMovie): string | null {
  return movie.release_date ? movie.release_date.slice(0, 4) : null
}

export async function fetchPopularMovies(signal?: AbortSignal): Promise<TmdbMovie[]> {
  const token = import.meta.env.VITE_TMDB_ACCESS_TOKEN

  if (!token) {
    throw new Error(
      'Missing VITE_TMDB_ACCESS_TOKEN. Copy .env.example to .env.local and set it, then restart the dev server.',
    )
  }

  const response = await fetch(`${API_BASE_URL}/movie/popular`, {
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

  const data = (await response.json()) as TmdbPopularResponse
  return data.results
}