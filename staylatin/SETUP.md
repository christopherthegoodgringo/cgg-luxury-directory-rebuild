# StayLatin — setup and launch checklist

StayLatin is a separate travel directory for Latin America. Keep all StayLatin application files under `staylatin/` in this repository.

## Current status

- Static page prototypes: homepage, directory, traveler account, business onboarding, and admin dashboard.
- Dedicated Supabase project created and verified: `lrfyoundimxakuhwuood` (US East, N. Virginia).
- `database/schema.sql` applied to the dedicated StayLatin project; 10 StayLatin tables verified.
- `staylatin-config.js` points to the dedicated project using its browser-safe publishable key.
- Traveler sign-up profile trigger installed: new Auth users receive a `staylatin_profiles` row with the default traveler role.
- Security advisor was rerun after the admin-review RPC hardening; review its current result before launch.
- Business onboarding now writes to a dedicated private `staylatin_business_submissions` table; only the submitting owner can read their own submission through client policies.
- Admin dashboard is connected to the private submission queue and checks the trusted `app_metadata.role=admin` claim before revealing data.
- Protected review RPC validates the admin claim and uses invoker security with RLS; approvals create published listings marked `unverified`, while rejections require a reason. A real admin account still needs to be configured and the full workflow tested.
- Image uploads and memberships are not yet connected.
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
6. Business submission storage and admin review UI/RPC are implemented; test owner submission and admin-only approval/rejection with separate accounts. Image storage and membership status remain pending.
7. Keep payment checkout disabled until recurring plans and verified webhook handling are configured and tested.
8. Test traveler, business-owner, and admin permissions with separate test accounts before launch.

## Launch checklist

- [x] Dedicated StayLatin backend exists and is healthy.
- [x] Schema migration applied only to that project.
- [x] New-user profile trigger installed.
- [ ] Production site URL and allowed auth redirect URLs configured in Supabase Auth.
- [ ] RLS policies tested for anonymous, traveler, business owner, and admin access.
- [ ] Admin authorization is enforced server-side.
- [x] Business form persists private pending-review submissions for signed-in users.
- [x] Admin portal reads private submissions only after a trusted admin claim check; review RPC requires that claim and relies on RLS.
- [ ] End-to-end test submission, approval, rejection, listing visibility, and audit logging with separate owner/admin accounts.
- [ ] Image uploads enforce size/type limits and safe access rules.
- [ ] Account creation, sign-in, sign-out, and password recovery tested.
- [ ] Membership billing and webhook verification tested in sandbox before live billing.
- [ ] Privacy policy, terms, contact details, and data deletion workflow reviewed.
- [ ] Illustrative listings replaced or clearly kept labeled until each partner is verified.
- [ ] Mobile, accessibility, and production URL checks completed.

**Traveler authentication is wired to the dedicated project, but it still needs a real end-to-end test. Do not treat business approvals or billing as live until their workflows are implemented and tested.**
