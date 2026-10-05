<<<<<<< HEAD
import { BrowserRouter, Route, Routes } from 'react-router'
import SearchBar from './components/SearchBar'
import PopularMovies from './components/PopularMovies'
import MediaDetailPage from './pages/MediaDetailPage'

function Home() {
  return (
    <>
      <SearchBar />
      <PopularMovies />
    </>
  )
}
=======
import Hero from './components/Hero'
import PopularMovies from './components/PopularMovies'
>>>>>>> parent of 2728ec8 (feat: search bar added. extra details included in AGENTS.md to correct some details related to agents' behaviour)

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
        <header className="border-b border-zinc-900">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <a href="/" className="text-sm font-semibold tracking-tight">
              MovieTracker
            </a>
            <a href="/#popular" className="text-sm text-zinc-400 hover:text-zinc-100">
              Popular
            </a>
          </nav>
        </header>

<<<<<<< HEAD
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:kind/:id" element={<MediaDetailPage />} />
          </Routes>
        </main>
=======
      <main className="flex-1">
        <Hero />
        <PopularMovies />
      </main>
>>>>>>> parent of 2728ec8 (feat: search bar added. extra details included in AGENTS.md to correct some details related to agents' behaviour)

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