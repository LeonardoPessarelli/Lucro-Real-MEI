# Supabase Setup — Manual Steps

## 1. Run the migration

1. Access [Supabase Dashboard](https://app.supabase.com) and open your project.
2. Go to **SQL Editor**.
3. Paste the contents of `migrations/001_initial_schema.sql`.
4. Click **Run**.

Verify that 3 tables were created: `profiles`, `transactions`, `subscriptions`.

## 2. Enable Auth Providers

Go to **Authentication → Providers** in the Supabase Dashboard.

### Google
- Enable **Google**.
- Fill in **Client ID** and **Client Secret** from [Google Cloud Console](https://console.cloud.google.com/).
- Set Redirect URL to: `https://<your-project-ref>.supabase.co/auth/v1/callback`

### Apple
- Enable **Apple**.
- Fill in **Service ID**, **Team ID**, **Key ID**, and **Private Key** from [Apple Developer](https://developer.apple.com/).
- Set Redirect URL to: `https://<your-project-ref>.supabase.co/auth/v1/callback`

## 3. Security notes

- All tables have **Row Level Security (RLS)** enabled.
- Users can only read/write their own data.
- The `subscriptions` table is **read-only for users** — writes must come via the `service_role` key (e.g., from a webhook handler server-side).
