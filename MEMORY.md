# MEMORY.md

Running log of features. One short entry per feature, newest at the top.

## Detail routes and id-linked cards

Cards now navigate to a per-item detail page.

- `src/components/MovieCard.tsx` — takes a required `kind: MediaKind` and wraps
  its content in a react-router `<Link to={`/​${kind}/${movie.id}`}>`, so each
  card links to its own detail route by media type and id.
- `PopularMovies` passes `kind="movie"`, `PopularShows` passes `kind="tv"`.
- `src/lib/tmdb.ts` — added the `MediaKind` type and `fetchMediaById(kind, id,
  signal)`, which dispatches to the movie or TV detail fetcher.
- `src/components/MediaDetailsPage.tsx` — reads `:id` via `useParams`, fetches
  through `fetchMediaById` with an AbortController, and renders `<MediaDetails>`
  with skeleton and error states; non-numeric ids show an error.
- `src/App.tsx` — added routes `/movie/:id` and `/tv/:id`, each rendering
  `<MediaDetailsPage kind="movie" | "tv" />`.

## Media details component

`src/components/MediaDetails.tsx` — presentational component that renders a
movie or TV show from a TMDB detail response.

- Takes `media: TmdbMediaDetails` as a prop and auto-detects the type with the
  existing `isTvShow()` helper, so the same component serves both media kinds.
- Renders a poster, a Movie/TV show badge, the title, year, rating and overview,
  plus runtime for movies or season count for TV shows.
- Mobile-first: single column on mobile, `sm:grid-cols-[12rem_1fr]` from `sm` up.
- `src/lib/tmdb.ts` — added the `TmdbMediaDetails` type (extends `TmdbMovie`)
  and typed `fetchMovieById()` / `fetchTvShowById()` to return it instead of
  `unknown`.

## Movie vs TV detection helper

`src/lib/tmdb.ts` — added `isTvShow(response: unknown): boolean`.

- Takes the raw JSON from `fetchMovieById()` / `fetchTvShowById()` (both return
  `unknown`) and returns `true` when the object contains a `seasons` or
  `episodes` key, since TMDB movie detail responses never include those.
- Guards against null/non-object payloads before doing the `in` checks.

## 404 page

`src/components/NotFoundPage.tsx`, mounted at a wildcard route.

- `App.tsx` is now wrapped in `BrowserRouter` and uses `<Routes>`. The catch-all
  is `<Route path="*" element={<NotFoundPage />} />`, which matches any URL that
  no other route claims.
- "Back to home" is a react-router `<Link to="/">` for client-side navigation, so
  it does not trigger a full page reload. The header brand link was converted to
  a `<Link>` for the same reason.
- The header "Popular" link stays a plain `<a href="/#popular">` because it is a
  hash on the same page, not a route change.
- `Compass` icon from `lucide-react`, decorative so it carries `aria-hidden`.
- Layout follows the mobile-first rule: centred single column, padding grows
  from `py-16` to `sm:py-24`.

### Notes

- Deep links return HTTP 200 in dev and in `vite preview` because the SPA
  fallback serves `index.html` for every path. A real 404 status needs a host
  rewrite, which Vite's preview does not do.
- The package is `react-router@8`; import from `react-router`, not
  `react-router-dom`.

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

## Popular TV shows section

Below the popular movies, the home page now lists popular TV series.

- `src/lib/tmdb.ts` — added `fetchPopularShows()` calling `GET /3/tv/popular`, and a small internal `fetchPopular()` helper to remove duplication between movie/show fetches (shared headers, auth, error handling).
- `src/components/PopularShows.tsx` — new component following the same loading/error/ready states, grid and mobile-first breakpoints as `PopularMovies.tsx`. Renders each show with `MovieCard` and passes `kind="tv"` so any future detail routing can treat them as series.
- `src/App.tsx` — `HomePage` now renders `<SearchBar />`, `<PopularMovies />`, then `<PopularShows />`.

### Notes

- `MovieCard` still only renders poster, title and year (date handled via the existing `releaseYear()` which already falls back to `first_air_date`). No extra network calls are made for the list view.
- Grid matches the requested layout: 2 columns on mobile, 6 columns on desktop.