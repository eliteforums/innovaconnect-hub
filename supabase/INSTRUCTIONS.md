# InnovaHack 2026 — Supabase Setup Instructions

## Overview

This project uses [Supabase](https://supabase.com) as the backend for:
- **Database** — registrations, contact inquiries, editable site content, sponsors
- **Auth** — admin panel authentication
- **Storage** — resume uploads, sponsor logo uploads

---

## Recent Updates (April 2026)

The following changes have been made to the InnovaHack event:
- **Registration Fee:** Updated from ₹100 to **₹50**
- **Team Selection:** Now showcasing **"top 1% teams"** will be shortlisted
- **Startup Funding:** New key fact added: **₹50 Lakhs+ startup funding** available (highlighted in hero)
- **Startup Track:** Updated with funding information up to ₹50 lakhs or more
- **ROI Calculation:** Updated to reflect ₹45,000+ total value (900x ROI on ₹50 fee)

All database seed data has been updated in `schema.sql` with these new values.

---

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in (or create a free account).
2. Click **"New Project"**.
3. Fill in:
   - **Project Name:** `innovahack-2026` (or any name you prefer)
   - **Database Password:** choose a strong password and save it securely
   - **Region:** choose the closest to your users (e.g., South Asia)
4. Click **"Create new project"** and wait ~2 minutes for it to provision.

---

## Step 2: Run the Database Schema

1. In your Supabase project, go to the **SQL Editor** (left sidebar).
2. Click **"New Query"**.
3. Open the file `supabase/schema.sql` from this repository.
4. Copy the entire contents and paste it into the SQL Editor.
5. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`).
6. You should see a success message. This will create all tables, indexes, RLS policies, and seed the default site content.

> **Note:** If you get an error about a policy already existing, that's fine — it means the table was already set up. You can safely ignore duplicate policy errors.

---

## Step 3: Create Storage Buckets

### Resume Bucket (Private)

1. Go to **Storage** in the left sidebar.
2. Click **"New bucket"**.
3. Name it exactly: `resumes`
4. Toggle **"Public bucket"** to **OFF** (private).
5. Click **"Save"**.

### Sponsor Logos Bucket (Public)

1. Click **"New bucket"** again.
2. Name it exactly: `sponsors`
3. Toggle **"Public bucket"** to **ON**.
4. Click **"Save"**.

### Storage Policies for `resumes` bucket

In the **Storage > resumes > Policies** tab, add:

- **INSERT policy** — Allow anyone to upload:
  ```sql
  (bucket_id = 'resumes')
  ```
  Set to: `INSERT`, check for: `TRUE`

- **SELECT policy** — Allow only authenticated users (admins) to read:
  ```sql
  (bucket_id = 'resumes' AND auth.role() = 'authenticated')
  ```

### Storage Policies for `sponsors` bucket

- **SELECT policy** — Public read:
  ```sql
  (bucket_id = 'sponsors')
  ```
  Set to: `SELECT`, check for: `TRUE`

- **ALL policy** — Authenticated users can upload/manage:
  ```sql
  (bucket_id = 'sponsors' AND auth.role() = 'authenticated')
  ```

---

## Step 4: Create the Admin User

The admin panel uses Supabase Auth for login. You need to create an admin user manually.

1. In your Supabase project, go to **Authentication > Users**.
2. Click **"Invite user"** or **"Add user"**.
3. Enter the admin email and a strong password.
4. Click **"Create user"**.

> You can create multiple admin users this way. All authenticated users can access the admin panel.

---

## Step 5: Get Your API Keys

1. Go to **Project Settings** (gear icon, bottom left).
2. Click **"API"** in the settings menu.
3. You'll find:
   - **Project URL** — looks like `https://xxxxxxxxxxxx.supabase.co`
   - **anon / public key** — starts with `eyJ...`

---

## Step 6: Configure Environment Variables

1. In the root of the project (`innovaconnect-hub/`), create a file named `.env.local`:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

2. Replace the values with your actual Project URL and anon key from Step 5.

> **Security:** Never commit `.env.local` to version control. It is already listed in `.gitignore`.

---

## Step 7: Verify the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Visit [http://localhost:5173](http://localhost:5173) — the site should load normally.
3. Visit [http://localhost:5173/admin](http://localhost:5173/admin) — you should see the admin login screen.
4. Log in with the credentials you created in Step 4.
5. You should now see the full admin dashboard.

---

## Database Tables Reference

### `registrations`

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `full_name` | TEXT | Participant's full name |
| `email` | TEXT | Participant's email |
| `contact_no` | TEXT | Phone number |
| `city` | TEXT | City of living |
| `resume_url` | TEXT | URL to resume file in Supabase Storage |
| `organisation_name` | TEXT | College or company name |
| `year_or_experience` | TEXT | e.g. "3rd Year" or "2 years exp" |
| `branch_or_department` | TEXT | e.g. "Computer Science" |
| `skills` | TEXT[] | Array of selected skills |
| `github_url` | TEXT | GitHub profile URL |
| `linkedin_url` | TEXT | LinkedIn profile URL |
| `team_type` | TEXT | One of: solo, duo, trio, quad |
| `team_members` | JSONB | Array of co-member detail objects |
| `consent` | BOOLEAN | Data sharing consent |
| `status` | TEXT | pending / shortlisted / rejected / confirmed |
| `notes` | TEXT | Admin notes about this registration |
| `created_at` | TIMESTAMPTZ | Submission timestamp |

### `site_content`

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `section` | TEXT | Unique section key (e.g. `hero`, `faq`) |
| `content` | JSONB | Section-specific content as JSON |
| `updated_at` | TIMESTAMPTZ | Last updated timestamp |
| `updated_by` | TEXT | Admin email who last updated |

**Available section keys:**
- `hero` — Hero section (title, prize pool, key facts, ticker)
- `domains` — Hackathon domain tracks
- `process` — Process steps
- `outcomes` — What participants get
- `faq` — Frequently asked questions
- `fee` — Registration fee section
- `cta` — Call-to-action section
- `about` — About page content
- `settings` — Global settings (emails, social links, etc.)
- `skills_list` — Skills available in the registration form

### `contact_inquiries`

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | TEXT | Sender's name |
| `email` | TEXT | Sender's email |
| `company` | TEXT | Sender's company (optional) |
| `category` | TEXT | Inquiry category |
| `subject` | TEXT | Subject line |
| `message` | TEXT | Full message body |
| `status` | TEXT | new / read / replied / archived |
| `created_at` | TIMESTAMPTZ | Submission timestamp |

### `sponsors`

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | TEXT | Sponsor/partner name |
| `logo_url` | TEXT | URL to logo in Supabase Storage |
| `website_url` | TEXT | Link to sponsor website |
| `category` | TEXT | title / gold / domain_ai / hiring / tech / education / college / community |
| `track` | TEXT | Specific domain track (if domain sponsor) |
| `is_active` | BOOLEAN | Whether to display on website |
| `sort_order` | INTEGER | Display order |

---

## Admin Panel Features

Once logged in at `/admin`, you can:

| Section | What You Can Edit |
|---|---|
| **Overview** | Stats dashboard — total registrations, status breakdown |
| **Registrations** | View all submissions, update status, add notes, export CSV |
| **Inquiries** | View contact form submissions, mark as read/replied |
| **Hero Editor** | Edit hero section title, prize pool, key facts, ticker text |
| **Domains Editor** | Add/edit/remove hackathon domain tracks |
| **Process Editor** | Edit the 5-step process section |
| **FAQ Editor** | Add/edit/remove FAQ questions and answers |
| **Outcomes Editor** | Edit "What You Get" section content |
| **Fee Editor** | Edit fee amount, location, ROI benefits |
| **CTA Editor** | Edit call-to-action section |
| **About Editor** | Edit About page content |
| **Sponsors Manager** | Add sponsor logos, manage categories |
| **Settings** | Edit contact emails, social media links, site-wide settings |

---

## Deployment (Vercel)

When deploying to Vercel, add your environment variables in the Vercel dashboard:

1. Go to your Vercel project → **Settings** → **Environment Variables**.
2. Add:
   - `VITE_SUPABASE_URL` → your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
3. Redeploy the project.

---

## Troubleshooting

**"Missing Supabase environment variables" error**
→ Make sure `.env.local` exists and has the correct values. Restart the dev server after creating it.

**Admin login not working**
→ Make sure you created a user in Supabase Auth (Step 4). Check that the email and password are correct.

**Registrations not saving**
→ Check that RLS policies were created correctly. In Supabase SQL Editor, run:
```sql
SELECT * FROM pg_policies WHERE tablename = 'registrations';
```
You should see `registrations_public_insert` in the list.

**Resume upload failing**
→ Make sure the `resumes` storage bucket exists and the INSERT policy is set to allow public uploads.

**Content edits not showing on site**
→ The site fetches content from Supabase on load. Hard-refresh the page (`Ctrl+Shift+R`) after saving changes in the admin panel.

---

## Local Development Without Supabase

If you want to run the project without a Supabase connection (content will use hardcoded defaults, forms will not submit):

1. Create `.env.local` with placeholder values:
```
VITE_SUPABASE_URL=https://placeholder.supabase.co
VITE_SUPABASE_ANON_KEY=placeholder
```

2. The app will fall back to default content for all sections. Forms will show a warning but the UI will still render.

---

*Last updated: InnovaHack 2026 — Elite Forums*