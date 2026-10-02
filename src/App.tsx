import PopularMovies from './components/PopularMovies'
import SearchBar from './components/SearchBar'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-900">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <span className="text-sm font-semibold tracking-tight">MovieTracker</span>
          <a href="#popular" className="text-sm text-zinc-400 hover:text-zinc-100">
            Popular
          </a>
        </nav>
      </header>

      <main className="flex-1">
        <SearchBar />
        <PopularMovies />
      </main>

      <footer className="border-t border-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-zinc-500">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </div>
      </footer>
    </div>
  )
}

export default App