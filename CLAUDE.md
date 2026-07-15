@AGENTS.md

# Components

React components live in a `_components/` folder, never directly beside `page.tsx`.

- Route-private components go in a `_components/` folder inside that route (e.g. `app/admin/(shell)/settings/_components/`). A component's CSS module and any component-only helpers live in `_components/` with it.
- `page.tsx`, `layout.tsx`, `actions.ts`, and route-level styles stay at the route root, not in `_components/`.
- Components shared across routes go in the nearest common ancestor `_components/` (e.g. `app/_components/` for site-wide, `app/admin/(shell)/_components/` for admin-wide). Promote a component up only once a second route actually uses it.
