# MEMORY.md

Running log of features. One short entry per feature, newest at the top.

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