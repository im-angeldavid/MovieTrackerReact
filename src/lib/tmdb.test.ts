import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearDetailCache,
  directorsOf,
  fetchDetail,
  fetchPopularMovies,
  formatRuntime,
  mediaId,
  posterUrl,
  releaseYear,
} from './tmdb'
import type { TmdbDetail, TmdbMovie } from './tmdb'

const TOKEN = 'test-token'

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

const movieDetail = {
  id: 969681,
  title: 'Spider-Man: Brand New Day',
  tagline: 'A brand new day starts now.',
  overview: 'Fighting crime full-time as Spider-Man.',
  release_date: '2026-07-29',
  runtime: 145,
  status: 'Released',
  genres: [
    { id: 878, name: 'Science Fiction' },
    { id: 28, name: 'Action' },
  ],
  credits: { crew: [{ id: 1, name: 'Destin Daniel Cretton', job: 'Director' }] },
} as TmdbDetail

const tvDetail = {
  id: 1399,
  name: 'Game of Thrones',
  tagline: 'Winter is coming.',
  first_air_date: '2011-04-17',
  episode_run_time: [60],
  genres: [{ id: 10765, name: 'Sci-Fi & Fantasy' }],
  created_by: [{ id: 9813, name: 'David Benioff' }],
} as TmdbDetail

beforeEach(() => {
  clearDetailCache()
  // The global afterEach unstubs env, so restore the token for every case.
  vi.stubEnv('VITE_TMDB_ACCESS_TOKEN', TOKEN)
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('fetchDetail request shape', () => {
  it('calls the /movie endpoint with the bearer token and credits appended', async () => {
    const fetchMock = vi.mocked(fetch).mockResolvedValue(jsonResponse(movieDetail))

    await fetchDetail('movie', 969681)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]

    expect(url).toBe('https://api.themoviedb.org/3/movie/969681?append_to_response=credits')
    expect((init?.headers as Record<string, string>).Authorization).toBe(`Bearer ${TOKEN}`)
  })

  it('uses the /tv endpoint for series', async () => {
    const fetchMock = vi.mocked(fetch).mockResolvedValue(jsonResponse(tvDetail))

    await fetchDetail('tv', 1399)

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://api.themoviedb.org/3/tv/1399?append_to_response=credits',
    )
  })

  it('never attaches an AbortSignal to the shared request', async () => {
    const fetchMock = vi.mocked(fetch).mockResolvedValue(jsonResponse(movieDetail))

    await fetchDetail('movie', 969681)

    // A cached signal would poison the entry after a StrictMode unmount.
    expect(fetchMock.mock.calls[0][1]?.signal).toBeUndefined()
  })
})

describe('fetchDetail caching', () => {
  it('de-duplicates concurrent requests for the same id', async () => {
    const fetchMock = vi.mocked(fetch).mockResolvedValue(jsonResponse(movieDetail))

    const [a, b] = await Promise.all([fetchDetail('movie', 969681), fetchDetail('movie', 969681)])

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(a).toBe(b)
  })

  it('keeps movie and tv entries separate', async () => {
    const fetchMock = vi.mocked(fetch).mockImplementation(async (url) =>
      String(url).includes('/tv/') ? jsonResponse(tvDetail) : jsonResponse(movieDetail),
    )

    const [movie, show] = await Promise.all([fetchDetail('movie', 1), fetchDetail('tv', 1)])

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(movie?.title).toBe('Spider-Man: Brand New Day')
    expect(show?.name).toBe('Game of Thrones')
  })

  it('rejects with a 401 message when the token is wrong', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({}, 401))

    await expect(fetchDetail('movie', 1)).rejects.toThrow(/rejected the access token/)
  })

  it('does not cache a failed request', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 500))
    await expect(fetchDetail('movie', 7)).rejects.toThrow(/status 500/)

    fetchMock.mockResolvedValueOnce(jsonResponse(movieDetail))
    await expect(fetchDetail('movie', 7)).resolves.toBeTruthy()

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})

describe('fetchPopularMovies', () => {
  it('returns the results array', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({
        results: [{ id: 1, title: 'A', poster_path: '/a.jpg', release_date: '2026-01-01' }],
      }),
    )

    const results = await fetchPopularMovies()

    expect(fetch).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/movie/popular',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
      }),
    )
    expect(results).toHaveLength(1)
  })

  it('explains how to fix a missing token', async () => {
    vi.stubEnv('VITE_TMDB_ACCESS_TOKEN', '')

    await expect(fetchPopularMovies()).rejects.toThrow(/Missing VITE_TMDB_ACCESS_TOKEN/)
  })
})

describe('normalising movie vs tv shapes', () => {
  it('formats a movie runtime', () => {
    expect(formatRuntime({ id: 1, runtime: 145 })).toBe('2h 25m')
    expect(formatRuntime({ id: 1, runtime: 120 })).toBe('2h')
    expect(formatRuntime({ id: 1, runtime: 45 })).toBe('45m')
  })

  it('falls back to episode_run_time for series', () => {
    expect(formatRuntime({ id: 1, episode_run_time: [60] })).toBe('1h')
  })

  it('returns null when no runtime is known', () => {
    expect(formatRuntime({ id: 1 })).toBeNull()
  })

  it('reads the year from release_date or first_air_date', () => {
    expect(releaseYear({ release_date: '2026-07-29' })).toBe('2026')
    expect(releaseYear({ first_air_date: '2011-04-17' })).toBe('2011')
    expect(releaseYear({})).toBeNull()
  })

  it('builds poster urls and tolerates a null poster', () => {
    expect(posterUrl('/abc.jpg')).toBe('https://image.tmdb.org/t/p/w342/abc.jpg')
    expect(posterUrl(null)).toBeNull()
  })

  it('accepts id or show_id', () => {
    expect(mediaId({ id: 5 })).toBe(5)
    expect(mediaId({ show_id: 6 })).toBe(6)
    expect(() => mediaId({})).toThrow(/missing an id/)
  })
})

describe('directorsOf', () => {
  it('reads the flat job string used by movies', () => {
    expect(directorsOf(movieDetail)).toEqual(['Destin Daniel Cretton'])
  })

  it('reads the nested jobs array used by tv aggregate credits', () => {
    const detail = {
      id: 1,
      credits: {
        crew: [
          { id: 2, name: 'David Nutter', jobs: [{ job: 'Director' }] },
          { id: 3, name: 'Someone', jobs: [{ job: 'Writer' }] },
        ],
      },
    } as TmdbDetail

    expect(directorsOf(detail)).toEqual(['David Nutter'])
  })

  it('falls back to created_by when a series lists no directors', () => {
    expect(directorsOf(tvDetail)).toEqual(['David Benioff'])
  })

  it('returns an empty array when nothing is known', () => {
    expect(directorsOf({ id: 1 })).toEqual([])
  })
})