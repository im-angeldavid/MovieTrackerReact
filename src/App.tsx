import { BrowserRouter, Link, Route, Routes } from 'react-router'
import { Home } from 'lucide-react'
import NotFoundPage from './components/NotFoundPage'
import PopularMovies from './components/PopularMovies'
import PopularShows from './components/PopularShows'
import SearchBar from './components/SearchBar'

function HomePage() {
  return (
    <>
      <SearchBar />
      <PopularMovies />
      <PopularShows />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
        <header className="border-b border-zinc-900">
          <nav className="mx-auto flex max-w-7xl items-center px-4 py-4">
            <Link
              to="/"
              aria-label="Home"
              className="text-zinc-400 transition hover:text-zinc-100"
            >
              <Home className="size-5" />
            </Link>
          </nav>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <footer className="border-t border-zinc-900">
          <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-zinc-500">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App