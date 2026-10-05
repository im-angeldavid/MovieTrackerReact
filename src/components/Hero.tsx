function Hero() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-16 text-center sm:py-24">
      <p className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-medium tracking-widest text-amber-400 uppercase">
        Portfolio project
      </p>

      <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl">
        Track every movie and series you love
      </h1>

      <p className="max-w-xl text-base text-zinc-400 sm:text-lg">
        MovieTrackerReact keeps your watchlist, progress and ratings in one place, powered by
        The&nbsp;Movie&nbsp;Database.
      </p>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <a
          href="#popular"
          className="rounded-lg bg-amber-400 px-6 py-3 text-center text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
        >
          See what it does
        </a>
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-zinc-700 px-6 py-3 text-center text-sm font-semibold text-zinc-200 transition hover:border-zinc-500"
        >
          Data by TMDB
        </a>
      </div>
    </section>
  )
}

export default Hero