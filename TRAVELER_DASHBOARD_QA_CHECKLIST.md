# Traveler Dashboard QA Checklist

This checklist is for the `feature/traveler-dashboard` branch only. Do not merge, deploy, or apply the database migration to production until the backup and release gates below are complete.

## Release gates
- [ ] Verify a restorable Supabase backup/export, including existing Auth/profile-related records and database data.
- [ ] Provision a separate staging Supabase project; do not use production for exploratory writes.
- [ ] Apply the additive migration to staging and verify all six new tables and indexes.
- [ ] Confirm row-level security prevents one signed-in user from reading, changing, or deleting another user's rows.
- [ ] Implement secure shared-list token creation and validation through an RPC or Edge Function. Store only a cryptographic token hash; never expose private tables with public SELECT policies.
- [ ] Verify shared-list expiry and revocation are enforced by the server, not only hidden in the UI.
- [ ] Review existing Supabase security advisor warnings separately before launch.

## Authentication and account
- [ ] Sign up with a test account; verify email confirmation behavior.
- [ ] Sign in, refresh, close/reopen browser, and verify session behavior.
- [ ] Sign out and verify dashboard data is not visible to the signed-out user.
- [ ] Sign in as a second test user and verify the first user's data is inaccessible.
- [ ] Test expired/invalid sessions and network failures with clear user feedback.

## Favorites and listing metadata
- [ ] Save a listing and verify it appears in Favorites.
- [ ] Remove a favorite and verify the deletion persists after refresh.
- [ ] Verify saved listing metadata maps to existing `traveler_saved_places` fields: `listing_id`, `listing_name`, `category`, `city`, `country`, `photo_url`, and `listing_url`.
- [ ] Verify favorite state syncs between two browsers/devices using the same account.
- [ ] Verify an existing favorite is not duplicated on repeated clicks.

## Trips
- [ ] Create a trip with a valid name and optional dates.
- [ ] Reject an empty name, overlong name, or end date before start date.
- [ ] Add a saved listing to a trip and verify the correct metadata and ordering.
- [ ] Prevent duplicate listing items within the same trip.
- [ ] Edit and delete a trip; verify related items follow the intended cascade behavior.
- [ ] Verify another account cannot add items to or modify the trip.

## Shared lists
- [ ] Create a share link from a trip.
- [ ] Open the link in a signed-out/private browser and show only the intended shared trip data.
- [ ] Verify invalid, expired, and revoked tokens are rejected.
- [ ] Verify revocation takes effect immediately.
- [ ] Verify the token itself is never stored in clear text in the database or written to logs.
- [ ] Do not ship public sharing until all checks pass.

## Recently viewed and share activity
- [ ] Opening a listing records one recent-view event for a signed-in user.
- [ ] Repeated clicks do not create accidental duplicate events.
- [ ] Canceling the native share dialog does not create a share-history record.
- [ ] A completed native share or clipboard copy creates one share-history record.
- [ ] Ensure recent views and share history are scoped to the current account.

## Notifications and preferences
- [ ] Notifications load only for the current user.
- [ ] Marking a notification read persists after refresh.
- [ ] Preferences load, save, and persist across devices.
- [ ] Email notification preference is stored but does not send email until a real notification delivery workflow exists.
- [ ] Test empty states, long text, and mobile layout.

## UI and regression
- [ ] Test desktop and mobile widths, keyboard focus, Escape-to-close, and modal scrolling.
- [ ] Verify all tabs work and loading/empty/error states are understandable.
- [ ] Confirm card layout, listing order, photos, filters, affiliate logos, and existing directory actions are unchanged.
- [ ] Check browser console and network requests for runtime errors.
- [ ] Confirm the live GitHub Pages site remains unchanged until explicit approval to merge/deploy.

## Current known limitation
The current Shared tab is share history only. Secure public share links and recipient access have not been implemented yet. A JavaScript syntax check is not a substitute for functional browser and RLS tests.
