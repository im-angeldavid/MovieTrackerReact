import { useState } from 'react'
import { Search } from 'lucide-react'

function SearchBar() {
  const [query, setQuery] = useState('')

  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center gap-5 px-4 py-12 text-center sm:py-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
          What do you want to watch?
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400 sm:text-base">
          Search any movie or series to add it to your list, keep track of your progress and rate
          it once you are done.
        </p>
      </div>

      <form
        role="search"
        onSubmit={(event) => event.preventDefault()}
        className="w-full lg:w-1/2"
      >
        <label htmlFor="title-search" className="sr-only">
          Search movies and series
        </label>

        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-zinc-500"
          />
          <input
            id="title-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search movies, series, people..."
            className="w-full rounded-full border border-zinc-700 bg-zinc-900 py-3.5 pr-5 pl-12 text-sm text-zinc-100 transition outline-none placeholder:text-zinc-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 [&::-webkit-search-cancel-button]:hidden"
          />
        </div>
      </form>
    </section>
  )
}

export default SearchBar