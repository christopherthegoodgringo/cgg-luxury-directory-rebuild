# StayLatin — setup and launch checklist

StayLatin is a separate travel directory for Latin America. Keep all StayLatin application files under `staylatin/` in this repository.

## Current status

- Static page prototypes: homepage, directory, traveler account, business onboarding, and admin dashboard.
- Database schema draft: `database/schema.sql`.
- Backend: **not connected**.
- Business submissions, admin decisions, and memberships: prototype-only until a dedicated backend is configured.
- Payments: not connected; do not collect payment details in the prototype.
- Sample listings are illustrative and must not be presented as verified partners.

## Non-negotiable separation

1. Create a dedicated Supabase project for StayLatin.
2. Do not run StayLatin migrations against `cgg-luxury-directory` or `good-gringo-owner-portal`.
3. Do not copy CGG credentials, API keys, records, or user data into StayLatin.
4. Never put a Supabase service-role key in browser code. Use only the dedicated project's publishable/anon key in the frontend.
5. Keep admin privileges server-controlled; never trust a client-provided role or user-editable profile metadata to grant admin access.
6. Enable and test row-level security for every exposed table before connecting live users.

## Backend connection sequence

1. Confirm authorization to create the separate StayLatin Supabase project and review the quoted project cost.
2. Create the project in the CGG organization without changing either existing project.
3. Verify the new project's ID, region, and health status.
4. Review `database/schema.sql` and apply it only to the new StayLatin project.
5. Inspect migration results, row-level-security policies, and database security advisors.
6. Configure `staylatin-config.js` with the new project's URL and publishable key only.
7. Implement and test authentication, profile ownership, business submission/review, image storage, favorites, and membership status.
8. Keep payment checkout disabled until recurring plans and verified webhook handling are configured and tested.
9. Test traveler, business-owner, and admin permissions with separate test accounts before launch.

## Launch checklist

- [ ] Dedicated StayLatin backend exists and is healthy.
- [ ] Schema migration applied only to that project.
- [ ] RLS policies tested for anonymous, traveler, business owner, and admin access.
- [ ] Admin authorization is enforced server-side.
- [ ] Business forms persist submissions and support moderation.
- [ ] Image uploads enforce size/type limits and safe access rules.
- [ ] Account creation, sign-in, sign-out, and password recovery tested.
- [ ] Membership billing and webhook verification tested in sandbox before live billing.
- [ ] Privacy policy, terms, contact details, and data deletion workflow reviewed.
- [ ] Illustrative listings replaced or clearly kept labeled until each partner is verified.
- [ ] Mobile, accessibility, and production URL checks completed.

**Do not treat the prototype UI as a live account system, approval system, or billing system.**
