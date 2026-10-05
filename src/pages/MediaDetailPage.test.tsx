import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MediaDetailPage from './MediaDetailPage'
import { clearDetailCache } from '../lib/tmdb'
import type { TmdbDetail } from '../lib/tmdb'

const MOVIE = {
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

const TV = {
  id: 1399,
  name: 'Game of Thrones',
  tagline: 'Winter is coming.',
  overview: 'Noble families vie for control of the Iron Throne.',
  first_air_date: '2011-04-17',
  episode_run_time: [60],
  status: 'Ended',
  genres: [{ id: 10765, name: 'Sci-Fi & Fantasy' }],
  created_by: [
    { id: 9813, name: 'David Benioff' },
    { id: 9814, name: 'D. B. Weiss' },
  ],
} as TmdbDetail

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/:kind/:id" element={<MediaDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  clearDetailCache()
  vi.stubEnv('VITE_TMDB_ACCESS_TOKEN', 'test-token')
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('MediaDetailPage data fetching', () => {
  it('renders every essential field once the fetch resolves', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(MOVIE))

    renderAt('/movie/969681')

    expect(await screen.findByRole('heading', { level: 1, name: MOVIE.title })).toBeInTheDocument()

    expect(screen.getByText(MOVIE.tagline!)).toBeInTheDocument() // tagline
    expect(screen.getByText('2026')).toBeInTheDocument() // release date
    expect(screen.getByText('2h 25m')).toBeInTheDocument() // duration
    expect(screen.getByText('Science Fiction')).toBeInTheDocument() // genres
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('Destin Daniel Cretton')).toBeInTheDocument() // director
    expect(screen.getByText(MOVIE.overview)).toBeInTheDocument() // overview
  })

  it('requests the right endpoint for a movie', async () => {
    const fetchMock = vi.mocked(fetch).mockResolvedValue(jsonResponse(MOVIE))

    renderAt('/movie/969681')
    await screen.findByRole('heading', { level: 1, name: MOVIE.title })

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://api.themoviedb.org/3/movie/969681?append_to_response=credits',
    )
  })

  it('requests the tv endpoint and renders a series with its own field names', async () => {
    const fetchMock = vi.mocked(fetch).mockResolvedValue(jsonResponse(TV))

    renderAt('/tv/1399')
    await screen.findByRole('heading', { level: 1, name: TV.name })

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://api.themoviedb.org/3/tv/1399?append_to_response=credits',
    )

    // first_air_date is used as the date, episode_run_time as the duration.
    expect(screen.getByText('2011')).toBeInTheDocument()
    expect(screen.getByText('1h')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Created by' })).toBeInTheDocument()
    expect(screen.getByText('David Benioff, D. B. Weiss')).toBeInTheDocument()
  })

  it('shows the loading skeleton while the request is in flight', async () => {
    let release: (value: Response) => void = () => {}
    vi.mocked(fetch).mockReturnValue(
      new Promise<Response>((resolve) => {
        release = resolve
      }),
    )

    const { container } = renderAt('/movie/969681')

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()

    release(jsonResponse(MOVIE))
    await screen.findByRole('heading', { level: 1, name: MOVIE.title })
  })

  it('surfaces an API error instead of rendering an empty page', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({}, 401))

    renderAt('/movie/1')

    expect(await screen.findByText(/rejected the access token/)).toBeInTheDocument()
  })

  it('rejects a non-numeric id without calling the API', async () => {
    const fetchMock = vi.mocked(fetch)

    renderAt('/movie/not-a-number')

    expect(await screen.findByRole('heading', { name: 'Not found' })).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('survives StrictMode double-mounting and still shows the data', async () => {
    const { StrictMode } = await import('react')
    const fetchMock = vi.mocked(fetch).mockResolvedValue(jsonResponse(MOVIE))

    render(
      <StrictMode>
        <MemoryRouter initialEntries={['/movie/969681']}>
          <Routes>
            <Route path="/:kind/:id" element={<MediaDetailPage />} />
          </Routes>
        </MemoryRouter>
      </StrictMode>,
    )

    // Regression: the shared cache used to hand back the aborted first request,
    // leaving this stuck on the loading skeleton forever.
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: MOVIE.title })).toBeInTheDocument()
    })

    expect(fetchMock.mock.calls[0][1]?.signal).toBeUndefined()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})