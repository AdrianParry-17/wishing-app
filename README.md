# Wishing App

Core anonymous wish submission flow:

Client -> Next.js Route Handler -> Supabase Edge Function -> Database

The frontend never talks to Supabase directly. Only the Next.js server route sends requests to the edge function.

## Environment setup

1. Copy `.env.example` to `.env.local`.
2. Fill in required values:
	- `SUPABASE_URL`
	- `SUPABASE_ANON_KEY`
	- `SUPABASE_EDGE_SHARED_SECRET`
3. Optional:
	- `SUPABASE_EDGE_FUNCTION_NAME` (defaults to `submit_wish`)
	- `TURNSTILE_SECRET_KEY` and `TURNSTILE_VERIFY_URL` (only if CAPTCHA is enabled)

## Development

```bash
npm run dev
```

Open http://localhost:3000.

## API endpoint

- `POST /api/wish`
- Content-Type must be `application/json`
- Request body:

```json
{
  "content": "I wish for more trees in my city"
}
```

The route validates input, optionally verifies CAPTCHA, then proxies to Supabase `submit_wish`.

## Structure

- `app/api/wish/route.ts`: server proxy endpoint
- `lib/config/env.ts`: server env loading and validation
- `lib/services/*.ts`: service layer (validation, CAPTCHA, Supabase edge call, orchestration)
- `components/wish-playground.tsx`: minimal form UI
