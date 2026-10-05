# MEMORY.md

Running log of features. One short entry per feature, newest at the top.

## Movie detail pages with dynamic routes

Each card is now a `react-router` `<Link>` to `/{kind}/{id}` (`/movie/969681`,
`/tv/1399`). The package is `react-router@8`, **not** `react-router-dom` — all
components import from `react-router`.

- `src/pages/MediaDetailPage.tsx` — one route serves both media kinds, parsing
  the kind from the URL. Shows tagline, title, year, runtime, status, genres,
  overview and directors. Handles invalid ids, loading and error.
- `src/components/DetailMeta.tsx` — the metadata row, split out to keep both
  files well under the 150-line limit.
- `src/lib/useMediaDetail.ts` — shared fetch hook with an `AbortController`.

### TMDB shape differences between movies and TV (all verified)

Movie and TV responses are **not** the same shape, so the detail page normalises:

| Field | Movie | TV |
| --- | --- | --- |
| title | `title` | `name` |
| date | `release_date` | `first_air_date` |
| runtime | `runtime` (number) | `episode_run_time` (array) |
| directors | `credits.crew[].job === "Director"` | nested `credits.crew[].jobs[]` |

- **`credits` from `append_to_response=credits` is not enough for TV.** Movie
  `job` is a flat string; TV puts jobs in a `jobs` array, and the plain
  `/tv/{id}` crew returned zero directors. `directorsOf()` handles both shapes
  and falls back to `created_by` when TMDB lists no directors at all.
- One request gets everything: `/{kind}/{id}?append_to_response=credits`.
- `fetchDetail()` memoises promises in a module-level `Map` keyed by
  `kind:id`, so StrictMode's double-mount and repeat visits do not refetch.
  Rejections are evicted from the cache so one failure does not poison an id.

### Card animations

`transition-transform duration-300 ease-out`, then `lg:hover:scale-105` for the
desktop hover and `active:scale-95` for the mobile tap. The hover rule compiles
inside `@media (hover:hover)`, so it cannot stick on touch devices.

### Gotchas hit while building this

- `react-hooks/set-state-in-effect` (React Compiler lint rule) rejects
  `setState` at the top of an effect body. `useMediaDetail` compares the
  request key during render instead, which is the sanctioned pattern.
- `/tv/{id}` has no `show_id` field. TMDB uses a plain `id` for both kinds, so
  `mediaId()` only exists as a defensive fallback.

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
  falls back to a "No poster" tile when `poster_path` is null. Later became a
  `<Link>` to the detail route.
- Grid is `grid-cols-2` on mobile, `lg:grid-cols-6` on desktop, per the
  mobile-first rule in `AGENTS.md`.

### Gotchas hit while building this

- The token **must** be named `VITE_TMDB_ACCESS_TOKEN`. Vite strips any var
  without the `VITE_` prefix from the client bundle, so the original
  `TMDB_ACCESS_TOKEN` in `.env` was invisible to the app (verified by grepping
  a real build). Real value now lives in `.env.local`; `.env` is redundant.
- Env vars are read at build/dev-server start, so the dev server must be
  restarted after adding or changing `.env.local`.