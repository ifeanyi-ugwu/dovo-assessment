# Dovo Health — Patient Portal Assessment

A full-stack miniature patient portal: React Native mobile app + Node.js/Express API, backed by Supabase.

## What's in here

```text
backend/   Node.js/Express API — JWT-protected subscription endpoint
mobile/    React Native/Expo app — auth screens + dashboard
```

## Prerequisites

- Node.js 20+
- pnpm (`npm i -g pnpm`)
- A [Supabase](https://supabase.com) project (free tier is fine)

## Supabase setup

Run all of the following in the Supabase **SQL Editor** in order.

### 1. Create the `profiles` table

```sql
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  first_name text not null,
  metabolic_plan_status text not null default 'active'
);
```

### 2. Enable Row Level Security

```sql
alter table profiles enable row level security;

create policy "users can read own profile"
  on profiles for select
  using (auth.uid() = id);
```

### 3. Auto-create a profile on signup

This trigger reads `first_name` from the signup metadata so no manual seeding is needed.

```sql
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, metabolic_plan_status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', 'User'),
    'active'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

> `set search_path = public` on the function is required. Without it, Postgres resolves unqualified table names against the invoker's search path, which can cause the insert to silently target the wrong schema.

### 4. Disable email confirmation (development only)

In the Supabase dashboard go to **Authentication → Providers → Email** and turn off **Confirm email**. This lets you sign up and log in immediately without an inbox. Re-enable it before any production deployment.

## Running locally

### Backend

```bash
cd backend
cp .env.example .env   # then fill in values (see below)
pnpm install
pnpm dev
```

**`backend/.env`**

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
PORT=3000
CORS_ORIGIN=http://localhost:8081
```

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are on your Supabase project's **Settings → API** page.

### Mobile

```bash
cd mobile
cp .env.example .env   # then fill in values (see below)
pnpm install
pnpm start             # opens Expo dev server
```

Press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with [Expo Go](https://expo.dev/go).

**`mobile/.env`**

```env
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
EXPO_PUBLIC_API_URL=http://localhost:3000
```

> On a physical device, replace `localhost` in `EXPO_PUBLIC_API_URL` with your machine's local IP (e.g. `http://192.168.1.x:3000`).

## Architecture

### JWT security flow

1. The user signs in via Supabase Auth (email + password). Supabase returns a signed JWT.
2. The mobile app stores the JWT in AsyncStorage via the Supabase client and attaches it as a `Bearer` token on every request to the backend.
3. The backend's `requireAuth` middleware extracts the token from the `Authorization` header and calls `supabase.auth.getUser(token)`. This validates the token **against Supabase's Auth server** — the backend never attempts to verify the JWT signature itself, so there's no key-management surface to misconfigure.
4. On success, the verified `User` object is attached to the request and the route handler returns the mock Paystack subscription payload scoped to that user. A missing, malformed, or expired token gets a `401` before any business logic runs.

### Data access

- Profile data is fetched **directly from Supabase on the client**, not proxied through the backend. Row Level Security enforces that `auth.uid() = profiles.id`, so a user cannot read another user's row even if they construct a direct query.
- The backend exists solely for data that isn't in Supabase — here, the Paystack subscription status. The response is currently mocked; a real integration would call the Paystack API using a secret key that stays server-side rather than bundled in the app.

## API reference

### `GET /api/subscription-status`

Requires `Authorization: Bearer <supabase-jwt>`.

```json
{
  "status": "active",
  "plan": {
    "id": "glp1_monthly",
    "name": "GLP-1 Therapeutic Plan",
    "interval": "monthly",
    "amount": 45000,
    "currency": "NGN"
  },
  "subscription": {
    "id": "SUB_mock_8f3a2b1c",
    "customer_code": "CUS_<first-8-chars-of-user-id>",
    "status": "active",
    "next_payment_date": "<iso-date>",
    "createdAt": "<iso-date>"
  }
}
```

Amount is in kobo (Paystack's unit): `45000 kobo = ₦450.00`.

## Error responses

| Status | Body                                                       | Reason                     |
| ------ | ---------------------------------------------------------- | -------------------------- |
| 401    | `{ "error": "Missing or malformed Authorization header" }` | No `Bearer` token          |
| 401    | `{ "error": "Invalid or expired token" }`                  | Token rejected by Supabase |
