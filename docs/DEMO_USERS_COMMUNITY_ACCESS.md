# Demo Users & Community Access

## 5 Demo Users (different verification results)

All demo accounts use the **same password**: `StudexDemo123!`

| # | Email | Access | Description |
|---|--------|--------|-------------|
| 1 | `demo.full1@axiscolleges.in` | **Full** | Verified; full create, edit, delete, like, comment |
| 2 | `demo.full2@axiscolleges.in` | **Full** | Verified; same as above |
| 3 | `demo.partial@axiscolleges.in` | **Partial** | Can create, like, comment; cannot delete others' content |
| 4 | `demo.pending@axiscolleges.in` | **Partial** | Pending verification; same partial permissions |
| 5 | `demo.readonly@axiscolleges.in` | **Read-only** | View only; no post, like, or comment |

These are **client-side demo logins** (no Supabase auth records). Use any of the emails above with the shared password on the login screen to test access levels.

## Access rules

- **Full (verified)**  
  Create/edit/delete own content, like, comment, join groups.

- **Partial**  
  Create posts, like, comment, join groups; no delete (or limited delete).

- **Read-only**  
  View feed and content only; post composer and like actions are hidden or disabled.

## Database

- `profiles.access_level`: `'full' | 'partial' | 'read_only'` (see migration `20250216000000_add_community_access_level.sql`).
- New signups: verified college email → `full`, otherwise `read_only`. Admins can set `partial` or `read_only` for specific users.
