import { useEffect, useState } from 'react'
import { fetchPopularMovies, type TmdbMovie } from '../lib/tmdb'
import MovieCard from './MovieCard'

type Status = 'loading' | 'ready' | 'error'

const SKELETON_KEYS = Array.from({ length: 12 }, (_, index) => index)

function PopularMovies() {
  const [movies, setMovies] = useState<TmdbMovie[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    fetchPopularMovies(controller.signal)
      .then((results) => {
        setMovies(results)
        setStatus('ready')
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === 'AbortError') return
        setError(cause instanceof Error ? cause.message : 'Something went wrong.')
        setStatus('error')
      })

    return () => controller.abort()
  }, [])

  return (
    <section id="popular" className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Popular movies</h2>
        <span className="text-xs text-zinc-500">via TMDB</span>
      </div>

      {status === 'error' && (
        <p className="mt-6 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {status === 'loading' && (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
          {SKELETON_KEYS.map((key) => (
            <li key={key} className="aspect-2/3 animate-pulse rounded-lg bg-zinc-900" />
          ))}
        </ul>
      )}

      {status === 'ready' && (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
          {movies.map((movie) => (
            <li key={movie.id}>
              <MovieCard movie={movie} kind="movie" />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default PopularMovies