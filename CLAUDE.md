# Portfolio — Project Rules & Guidelines

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | TanStack Start |
| Database | Neon (Postgres) |
| ORM | Drizzle ORM |
| Auth | BetterAuth |
| i18n | i18next + react-i18next |
| UI Components | ShadCN |
| Styling | Tailwind CSS v4 |
| Env Validation | T3Env + Zod |
| Linting + Formatting | Biome |
| Pre-commit | Husky + lint-staged |
| Package Manager | Bun |
| Email | Resend + React Email |
| File Storage | Cloudflare R2 |
| Rate Limiting / Cache | Upstash Redis |
| Analytics | Umami |
| MDX Rendering | unified + remark + rehype + Shiki |

---

## Code Quality Rules

### Type Safety
- TypeScript strict mode is always on. No exceptions.
- Never use `any`. Use `unknown` and narrow the type explicitly.
- All function parameters and return types must be explicitly typed.
- All Drizzle query results must be typed via inferred schema types (`typeof table.$inferSelect`).
- Environment variables are only accessed through T3Env. Never access `process.env` directly.

### Idempotency
- All database mutations must be idempotent where possible (use upserts over blind inserts).
- API/server functions that create or update resources must be safe to call multiple times with the same input without producing duplicate side effects.
- All Drizzle migrations must be idempotent.

### No Magic Numbers
- Every numeric or string constant with a specific meaning must be declared as a named constant in its own module.
- Example: instead of `if (content.length > 5000)`, declare `const MAX_POST_CONTENT_LENGTH = 5000` and import it.

### No Comments
- Code must be self-documenting through naming alone.
- Comments are not written unless explicitly requested.
- If logic is complex enough to warrant explanation, it is a signal to refactor, not to comment.

### Module Scope
- Every function, constant, type, and class lives in its own clearly scoped module.
- No barrel files that re-export everything from a folder (`index.ts` re-exports are allowed only when the module has a deliberate public API).
- No cross-layer imports (e.g. a DB module must not import a UI component).

### Code Style
- Functions are preferred over classes unless a design pattern specifically requires a class.
- Named exports are preferred over default exports everywhere.
- Arrow functions are used for callbacks and inline expressions. Regular `function` declarations are used for top-level named functions.
- No implicit returns in multi-line arrow functions.

---

## Design Patterns

All seven patterns below are in active use in this project. Each must live in its own module.

### Singleton Pattern
**Use for:** Database client, Redis client, i18n instance, BetterAuth instance.
One instance is created and reused across the application. The module itself enforces this — export a single initialized instance, not a class to be instantiated by consumers.

### Builder Pattern
**Use for:** Constructing complex query objects (Drizzle query builders), constructing email templates (React Email), constructing MDX pipeline configurations.
A builder exposes a fluent interface where each method returns the builder itself, ending with a terminal `.build()` or `.render()` call.

### Factory Pattern
**Use for:** Creating server response objects, creating typed error objects, creating Drizzle query filters dynamically based on input shape.
A factory function accepts parameters and returns a fully constructed object. The consumer never calls `new` directly.

### Facade Pattern
**Use for:** The DB access layer (wrapping Drizzle behind clean service functions), the storage layer (wrapping R2 behind a clean upload/delete API), the email layer (wrapping Resend behind a single `sendEmail` call).
Consumers of these layers never interact with the underlying library directly.

### Adapter Pattern
**Use for:** Normalizing BetterAuth session shape into the app's internal `User` type, adapting Drizzle query result shapes into API response shapes, adapting external webhook payloads into internal event types.
An adapter takes one shape and returns another, with no side effects.

### Strategy Pattern
**Use for:** Sorting and filtering blog posts (sort by date, sort by popularity, filter by tag), rate limiting strategies (per-IP vs per-user), content rendering strategies (MDX vs plain markdown).
A strategy is a function or object implementing a shared interface, swapped at runtime or configuration time.

### Observer Pattern
**Use for:** Reaction count updates (when a reaction is written, the post's denormalized count is updated), comment notifications (when a comment is posted, an email notification is triggered), analytics event emission.
An event is emitted by a producer. One or more handlers respond to it independently, with no coupling between producer and handler.

---

## Project Structure

```
src/
  app/                   # TanStack Start routes and layouts
  components/            # Shared UI components (ShadCN + custom)
  db/
    schema.ts            # Drizzle schema (single source of truth)
    migrations/          # Generated migration files
    client.ts            # Singleton DB client
  services/              # Facade layer — one file per domain
    posts.ts
    comments.ts
    reactions.ts
    users.ts
  lib/
    auth.ts              # BetterAuth singleton
    redis.ts             # Upstash singleton
    storage.ts           # R2 facade
    email.ts             # Resend facade
    i18n.ts              # i18next singleton
  constants/             # All named constants live here
  types/                 # Shared TypeScript types and interfaces
  env.ts                 # T3Env schema and export
```

---

## Database Rules

- Schema is the single source of truth. Types are always inferred from schema, never declared separately.
- All tables have `created_at` and `updated_at` timestamps.
- Soft deletes are used for user-generated content (comments, reactions) — a `deleted_at` nullable column, not a hard `DELETE`.
- Denormalized counters (`like_count`, `dislike_count`, `comment_count`) are maintained on the `posts` table and updated atomically alongside the source mutation.
- Cursor-based pagination is used everywhere. Offset pagination is not used.

---

## API / Server Functions

- Every server function validates its input with a Zod schema before touching the DB.
- Every server function that mutates state checks authentication and authorization before executing.
- Rate-limited endpoints check Upstash before any DB access.
- Server functions never return raw Drizzle rows — they return adapter-mapped response types.

---

## i18n Rules

- Every user-facing string is a translation key. No hardcoded strings in JSX.
- Translation keys follow the format `section.component.element` (e.g. `blog.post.readMore`).
- Keys are namespaced by route/section to enable lazy loading.
- Default language is English (`en`). All keys must exist in `en` before being added to other locales.

---

## Git Rules

- Commits follow Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`.
- Husky pre-commit runs: Biome lint + format check on staged files.
- Husky pre-push runs: `tsc --noEmit` for a full type check.
- Feature branches are used for all non-trivial changes. Direct commits to `main` are only for hotfixes.

## Accessibility (a11y)

- All interactive components must pass Biome's a11y lint rules before commit.
- Every image requires an `alt` attribute. Decorative images use `alt=""`.
- Semantic HTML is preferred over `div` soup. Use `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>` appropriately.

---

## Styling

- All styling goes through Tailwind utility classes.
- No `style={{}}` props unless absolutely required (e.g. dynamic values not expressible in Tailwind).

---

## Error Handling

- Every TanStack Start route has an `errorComponent` defined.
- Errors are never silently swallowed — they are caught and surfaced to the user with a friendly UI.
- No empty `catch` blocks.

---

## Loading States

- Every async operation has a corresponding loading state.
- No data fetching without a `pendingComponent` or skeleton UI counterpart.

---

## Server / Client Boundary

- Files that contain DB access, secret env vars, or server-only logic are never imported by client components.
- TanStack Start's `'use server'` directive enforces this at the framework level, but the folder structure must also make this boundary visually obvious.

---

## Zod Schema Colocation

- Form validation schemas and API input schemas live next to the code that uses them.
- No global `schemas/` folder.
- Exception: schemas shared across multiple modules live in `types/`.

---

## Logging

- No `console.log` in committed code. Biome's `noConsole` rule is enabled and enforced at pre-commit.
- Structured server-side logging (if added later) uses a dedicated logger module, not `console`.
