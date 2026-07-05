# Tech Notes — Campaign Builder & Distribution

## Architecture Overview

**Backend:** FastAPI + SQLAlchemy 2.0 + SQLite + Pydantic v2  
**Frontend:** React + Vite + React Router + React Query + React Hook Form + Zod  
**Patterns:** Clean Architecture (Domain / Application / Infrastructure / Presentation), State Pattern, Factory Pattern, Repository Pattern, Unit of Work, DTO separation (Internal vs Public)

The codebase is organized into four layers. Dependencies point inward: Presentation → Application → Domain, and Infrastructure implements interfaces defined in Domain/Application.

---

## 1. Validation — Client, Server, or Both

**Both.** Validation is layered:

- **Frontend (Zod + React Hook Form):** Instant UX feedback — required fields, number ranges, email format. This layer is *convenience*, not authority.
- **Backend (Pydantic v2 on DTOs):** Type coercion and structural validation on every request. Catches malformed payloads before they reach the domain.
- **Domain (offer subclasses, Campaign.validate_window/validate_has_offers):** Business invariants live here — percent must be 1–100, ends_at must be after starts_at, launch requires ≥1 offer, schedule requires a future starts_at. These rules never change regardless of client or transport.

**How they stay in sync:** The Zod schemas in `frontend/src/features/campaigns/validators/campaignSchema.js` mirror the Pydantic models in `backend/app/application/dto/requests.py`. There is no code-generation between them, but both follow the spec — a change to the domain invariants (e.g. a new offer type) requires updating both. The domain layer is the single source of truth; the others are optimizations.

---

## 2. Lifecycle in Code — How States and Transitions Are Modeled

The campaign lifecycle is modelled with the **State Pattern**:

- `CampaignState` (abstract base) defines the interface: `schedule()`, `launch()`, `end()`, `can_edit()`, `allowed_actions()`.
- Four concrete states: `DraftState`, `ScheduledState`, `LiveState`, `EndedState` — each in its own file in `app/domain/states/`.
- `Campaign` delegates all lifecycle methods to its current state: `self._state.schedule(self, ...)`.

**How client and server agree on legal transitions:**

The server exposes `allowed_actions` in every campaign response. The frontend uses this list to render buttons: if `"launch"` is in `allowed_actions`, the Launch button appears; otherwise it's hidden. This means the client never guesses what transitions are legal — it always asks the server. Adding a new state or changing transition rules only touches the domain; the frontend adapts automatically.

---

## 3. Stale State — What Happens on a Concurrent Edit

Optimistic locking via a `version` integer on the Campaign entity.

- Every `PUT` and lifecycle `POST` (schedule/launch/end) includes `version` in the request body.
- The use case reads the campaign from the DB, compares `current_version` vs `request_version`, and raises `OptimisticLockError` (→ HTTP 409 Conflict) if they differ.
- The repository also double-checks the version on `save()` (defense-in-depth), incrementing it on each write.

**Scenario:** User A opens a draft (version=1). User B launches it (version goes to 2). User A saves their edit (sending version=1). The use case sees DB has version=2, rejects with 409. The frontend shows a toast: "Campaign has been modified. Please refresh." The user reloads and sees the campaign is now live (read-only).

---

## 4. The Distribution Link / QR — What It Encodes

The shareable link encodes only the **public token** (UUID v4) in the path:

```
https://example.com/c/<public_token>
```

We deliberately **do not** encode:
- Internal database IDs (security by obscurity is weak, but not exposing DB IDs reduces attack surface).
- Campaign status or metadata (the link should be permanent; the server resolves the campaign's current state on every request).
- Any secret or signature — the public token is the identity, and the campaign's visibility is controlled by its status alone.

**How the public page handles a non-live campaign:**

The public endpoint `GET /c/{token}` returns the campaign with its current status. The frontend (`LandingPage`) checks:
- If status is `live` → show offers and enrollment form.
- If `draft`/`scheduled` → show a "Coming Soon" message.
- If `ended` → show "Campaign Ended".

A **bad link** (unknown token) returns 404, which the frontend renders as an "Invalid Link" error state. Links never expire independently of the campaign.

---

## 5. Identity Without Auth

**What we accept:** An email address or phone number, submitted as `identity` + `identity_type` ("email" or "phone").

**Validation:**
- Frontend: Zod schema requires non-empty string; email type uses email keyboard on mobile.
- Backend: Pydantic validates the `identity_type` is exactly `"phone"` or `"email"`.
- No server-side email validation (e.g. MX lookup) or SMS verification — identity is unverified by design.

**Normalization (for dedup):**
- Email: `trim() + toLowerCase()`.
- Phone: strip spaces, parentheses, dashes, and plus signs.

**Duplicate prevention:**
- Database has a `UNIQUE(campaign_id, normalized_identity)` constraint.
- The use case first queries for an existing matching enrollment; if found, returns `already_enrolled=true` instead of creating a duplicate.
- The unique constraint acts as a safety net against race conditions.

---

## 6. One Model, Two Audiences

The boundary is drawn at the **response DTO level** in `app/application/dto/responses.py`:

- `CampaignResponse` — used for the internal Builder API. Contains: `id`, `public_token`, `version`, `allowed_actions`, `offers` (with full parameter objects).
- `PublicCampaignResponse` — used for the shopper-facing page. Contains only: `name`, `description`, `status`, `starts_at`, `ends_at`, `offers` (with only `display_data` — no raw parameter dicts, no IDs).

The same `Campaign` domain entity feeds both DTOs. The `PublicOfferResponse` transforms offer data into a presentation-friendly `display_data` (e.g. "20% off on Summer Collection") without exposing the raw parameter schema.

The public routes (`/api/v1/c/{token}`) only exist in `public_routes.py` and never reference internal IDs. The internal routes (`/api/v1/campaigns/...`) are in `campaign_routes.py`.

---

## What Was Cut for Time

1. **Enrollment count on the builder dashboard** — the endpoint and repository method exist (`get_by_campaign_id`), but I didn't add a count display to the CampaignEditPage or Dashboard. Simple to add: one extra query per campaign row.
2. **Live activity view** — polling or streaming enrollment activity for live campaigns. The data model supports it (enrollments have `enrolled_at`), but there's no frontend component for it.
3. **Full mobile responsiveness** — the shopper page is mobile-first. The builder sidebar collapses on mobile via a hamburger menu. But I didn't test every breakpoint systematically.
4. **Pagination** — the campaign list loads all campaigns. Not a problem for the expected scale, but a real system would paginate.
5. **Delete test file `tests/test_docker_e2e.py`** — it tests against a running Docker stack; useful for CI but not for unit testing.
6. **Alembic migration** — the SQLite DB is recreated via `Base.metadata.create_all()`. A real deployment would use formal migrations.

---

## How to Exercise the Flows

### Happy path
1. `GET /api/v1/campaigns` — empty list
2. `POST /api/v1/campaigns` — create a campaign with name, description, window
3. `PUT /api/v1/campaigns/{id}/offers` — add one of each offer type with parameters
4. `POST /api/v1/campaigns/{id}/schedule` — schedule with future starts_at
5. `POST /api/v1/campaigns/{id}/launch` — launch (or skip schedule, launch directly from draft)
6. `GET /api/v1/campaigns/{id}/distribution?base_url=...` — get QR + shareable link
7. Open `/c/{token}` in browser — see campaign name, offers, enrollment form
8. `POST /api/v1/c/{token}/enroll` — enroll with email; see offers rendered
9. Same identity again — receives `already_enrolled=true`

### Blocked action (launch without offers)
1. Create campaign (draft)
2. `POST /api/v1/campaigns/{id}/launch` — returns 422 with `BusinessRuleViolation: "Campaign must have at least one offer"`

### Non-live scan (opening link for a draft campaign)
1. Create campaign (stays draft)
2. Open `/c/{token}` — shows "Coming Soon" message, no offers, no enrollment form

### Stale edit
1. Create campaign, note version=1
2. `POST /api/v1/campaigns/{id}/launch` with version=1 → succeeds, version→2
3. `PUT /api/v1/campaigns/{id}` with version=1 → 409 Conflict

---

## AI Tool Usage

I used AI tools (Claude / opencode) to:
- Generate boilerplate code for DTOs, repository implementations, and tests.
- Refactor inline styles into CSS variables and shared components during the UI overhaul.
- Draft this TECH_NOTES.md based on a structured outline.

Every piece of AI-generated code was reviewed, tested, and often rewritten. the state machine logic, offer validation, normalization, separation of DTOs, and optimistic locking are my own design, implemented and verified.

---

## What I'd Do Next With More Time

1. **Add enrollment counts** to the builder: `CampaignResponse.enrollment_count` computed from the enrollments relation.
2. **Add a polling live-view** on the campaign edit page for live campaigns — show new enrollments appearing in real-time.
3. **Write integration tests** covering the full HTTP API (happy path, transition errors, optimistic lock conflicts, duplicate enrollment, bad links).
4. **Add proper error boundary components** in React to catch rendering crashes.
5. **Add keyboard navigation** to the offer builder and lifecycle controls for accessibility.
6. **Replace `alert()` fallback** in the distribution page copy handler with the toast system.
