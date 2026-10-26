# StayLatin — setup and launch checklist

StayLatin is a separate travel directory for Latin America. Keep all StayLatin application files under `staylatin/` in this repository.

## Current status

- Static page prototypes: homepage, directory, traveler account, business onboarding, and admin dashboard.
- Dedicated Supabase project created and verified: `lrfyoundimxakuhwuood` (US East, N. Virginia).
- `database/schema.sql` applied to the dedicated StayLatin project; 10 StayLatin tables verified.
- `staylatin-config.js` points to the dedicated project using its browser-safe publishable key.
- Traveler sign-up profile trigger installed: new Auth users receive a `staylatin_profiles` row with the default traveler role.
- Security advisor check currently reports no security findings; performance advisor findings remain for later optimization.
- Business submissions, admin decisions, image uploads, and memberships are not yet fully connected.
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

1. Create and verify the dedicated StayLatin project; do not modify either existing project.
2. Apply the reviewed schema only to StayLatin and inspect migration results, RLS policies, and security advisors.
3. Configure `staylatin-config.js` with the dedicated project's URL and publishable key only.
4. Configure the production site URL and allowed email-confirmation redirect URLs in Supabase Auth settings.
5. Test account creation, confirmation email, sign-in, sign-out, and password recovery with a test account.
6. Implement and test business submission/review, image storage, favorites, and membership status.
7. Keep payment checkout disabled until recurring plans and verified webhook handling are configured and tested.
8. Test traveler, business-owner, and admin permissions with separate test accounts before launch.

## Launch checklist

- [x] Dedicated StayLatin backend exists and is healthy.
- [x] Schema migration applied only to that project.
- [x] New-user profile trigger installed.
- [ ] Production site URL and allowed auth redirect URLs configured in Supabase Auth.
- [ ] RLS policies tested for anonymous, traveler, business owner, and admin access.
- [ ] Admin authorization is enforced server-side.
- [ ] Business forms persist submissions and support moderation.
- [ ] Image uploads enforce size/type limits and safe access rules.
- [ ] Account creation, sign-in, sign-out, and password recovery tested.
- [ ] Membership billing and webhook verification tested in sandbox before live billing.
- [ ] Privacy policy, terms, contact details, and data deletion workflow reviewed.
- [ ] Illustrative listings replaced or clearly kept labeled until each partner is verified.
- [ ] Mobile, accessibility, and production URL checks completed.

**Traveler authentication is wired to the dedicated project, but it still needs a real end-to-end test. Do not treat business approvals or billing as live until their workflows are implemented and tested.**
