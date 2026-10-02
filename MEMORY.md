# MEMORY.md

Running log of features. One short entry per feature, newest at the top.

## Search bar (replaces the hero section)

`src/components/Hero.tsx` was deleted and replaced by `src/components/SearchBar.tsx`.

- Controlled `<input type="search">` inside a `<form role="search">` with the
  magnifying glass from `lucide-react` (`Search` icon), absolutely positioned at
  `left-5` with `pointer-events-none` so it never blocks typing.
- Width is `w-full lg:w-1/2`: full width on mobile, exactly 50% from the `lg`
  breakpoint (64rem) up.
- Shape is `rounded-full`, not square.
- Added `[&::-webkit-search-cancel-button]:hidden` to drop the native WebKit
  clear "x", which otherwise renders as a square glyph inside the round input.
- Accessible naming via a `sr-only` `<label>` plus `aria-hidden` on the
  decorative icon.
- The badge, tagline and CTA buttons from the old hero are gone. Copy is just
  the heading and one short description of what search does.

Note: the form currently calls `preventDefault()` only — no search endpoint is
wired up yet, so submitting reloads nothing and does nothing.

## Popular movies section

Replaces the placeholder feature grid on the landing page.

- `src/lib/tmdb.ts` — TMDB client. Holds the API/image base URLs and a
  `fetchPopularMovies()` call to `GET /3/movie/popular` using a v4 bearer token
  (`Authorization: Bearer <VITE_TMDB_ACCESS_TOKEN>`). Exports `posterUrl()` and
  `releaseYear()` helpers. Types only the fields actually used, so new TMDB
  response fields do not break the build.
- `src/components/PopularMovies.tsx` — fetches on mount, renders the grid plus
  loading (12 skeleton tiles) and error states. Uses `AbortController` so
  React StrictMode's double-mount in dev cancels the first request.
- `src/components/MovieCard.tsx` — poster (`w342`) with title and year,
  falls back to a "No poster" tile when `poster_path` is null.
- Grid is `grid-cols-2` on mobile, `lg:grid-cols-6` on desktop, per the
  mobile-first rule in `AGENTS.md`.

### Gotchas hit while building this

- The token **must** be named `VITE_TMDB_ACCESS_TOKEN`. Vite strips any var
  without the `VITE_` prefix from the client bundle, so the original
  `TMDB_ACCESS_TOKEN` in `.env` was invisible to the app (verified by grepping
  a real build). Real value now lives in `.env.local`; `.env` is redundant.
- Env vars are read at build/dev-server start, so the dev server must be
  restarted after adding or changing `.env.local`.