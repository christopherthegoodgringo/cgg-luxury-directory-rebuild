# CGG Traveler Dashboard — implementation notes

## Safety baseline
- Base branch: main (unchanged)
- Source backup branch: pre-traveler-dashboard-backup-20261025
- Work branch: feature/traveler-dashboard
- Starting index.html blob SHA: b54af6c6d0f530ed35b434ee0ffbd3102a039705
- Supabase project: cgg-luxury-directory (argdxsqbvtwheitsunbf), us-east-1
- Existing traveler tables: traveler_saved_places, traveler_subscribers
- Observed row counts: traveler_saved_places=0; traveler_subscribers=2
- No live DB migration has been applied by this work.

## Proposed feature scope
1. Favorites synced to the authenticated account.
2. Shared property history, distinguishing share attempts from confirmed recipient views.
3. Trip collections and items.
4. Revocable shared-list links (must be mediated by a token validation RPC or Edge Function; no public table policy).
5. Recently viewed listings.
6. In-dashboard notifications and traveler preferences.

## Security and deployment gates
- Obtain a verified Supabase database backup/export before applying DDL.
- Keep all development changes on this branch until syntax, RLS, cross-account isolation, responsive layout, and auth flows are checked.
- Do not add broad public SELECT policies to private traveler tables.
- Do not commit user records, secrets, or service-role keys.
- The existing Supabase security advisor reports leaked-password protection disabled and security-definer RPCs callable by anon/authenticated roles; review those separately before launch.
- Public main branch and Pages deployment remain untouched until an explicit release step.
