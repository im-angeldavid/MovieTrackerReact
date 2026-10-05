import { Link } from 'react-router'
import { Compass } from 'lucide-react'

function NotFoundPage() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-4 py-16 text-center sm:py-24">
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400"
      >
        <Compass className="size-6" />
      </span>

      <div>
        <p className="text-sm font-medium tracking-widest text-amber-400 uppercase">Error 404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          This page does not exist
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400">
          The title you are looking for may have been removed, or the link might be broken.
        </p>
      </div>

      <Link
        to="/"
        className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
      >
        Back to home
      </Link>
    </section>
  )
}

export default NotFoundPage