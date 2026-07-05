# Campaign Builder & Distribution

A fullstack application for creating, managing, and distributing marketing campaigns with a public shopper enrollment page.

## Tech Stack

**Backend:** Python 3.12, FastAPI, SQLAlchemy 2.0, SQLite, Pydantic v2  
**Frontend:** React 18, Vite, React Router, React Query, React Hook Form, Zod  
**Infrastructure:** Docker Compose (multi-stage frontend build + nginx, Python backend)

## Quick Start

### Prerequisites
- Docker and Docker Compose (recommended)
- OR Python 3.12+ and Node.js 18+ (local dev)

### Using Docker (recommended)

```bash
docker compose up --build
```

- Backend API: http://localhost:8000
- Frontend (admin panel): http://localhost:3000
- API docs: http://localhost:8000/docs

### Local Development

**Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Run tests:**
```bash
cd backend
python -m pytest tests/ -v
```

## Using the Application

### Builder (http://localhost:3000)

1. **Dashboard** — overview of all campaigns with status breakdown
2. **Campaigns** — list all campaigns, search by name, filter by status
3. **Create Campaign** — set name, description, optional window (dates)
4. **Edit Campaign** — three tabs:
   - **Details** — edit name/description/window (draft only) or view read-only info
   - **Offers** — add/remove offer types with parameters
   - **Lifecycle** — schedule, launch, or end the campaign
5. **Distribution** — view QR code and shareable link for a live campaign

### Shopper Page (http://localhost:3000/c/{public_token})

- **Live campaign:** shows campaign info, offers with descriptions, enrollment form (email or phone)
- **Non-live campaign:** shows appropriate status message (Coming Soon / Ended)
- **Duplicate enrollment:** recognized and returns "Already Enrolled"

### Offer Types

| Type | Parameters | Example |
|------|-----------|---------|
| % Off Product | `percent`, `applies_to` | 20% off on Summer Collection |
| Fixed $ Off Cart | `amount_off`, `min_basket` | $15 off (min. $50 basket) |
| Earn Stickers | `stickers`, `per_amount` | Earn 5 stickers per $25 spent |

### API Endpoints

**Internal (Builder):**
- `GET /api/v1/campaigns` — list all
- `POST /api/v1/campaigns` — create (name, description, starts_at?, ends_at?)
- `GET /api/v1/campaigns/{id}` — get by ID
- `PUT /api/v1/campaigns/{id}` — update (includes version for optimistic locking)
- `DELETE /api/v1/campaigns/{id}` — delete
- `POST /api/v1/campaigns/{id}/schedule` — schedule (requires starts_at, offers, version)
- `POST /api/v1/campaigns/{id}/launch` — launch (requires offers, version)
- `POST /api/v1/campaigns/{id}/end` — end (requires version)
- `PUT /api/v1/campaigns/{id}/offers` — set offers
- `GET /api/v1/campaigns/{id}/distribution?base_url=...` — QR + link

**Public (Shopper):**
- `GET /api/v1/c/{token}` — get public campaign info
- `POST /api/v1/c/{token}/enroll` — enroll (identity + identity_type)

## Architecture Notes

See [TECH_NOTES.md](TECH_NOTES.md) for detailed decisions on:
- Validation strategy
- State machine design
- Stale state handling
- Distribution link design
- Identity without auth
- Public vs internal API separation
