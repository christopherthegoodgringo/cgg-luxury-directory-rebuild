# StayLatin Traveler Experience — Release QA Checklist

Use two separate test traveler accounts (A and B), plus an administrator account. Never use real private messages as test content. Record browser, date, result, and screenshot for each failed test.

## P0 — release blockers

- [ ] Signup with a new email; verify required fields, password validation, duplicate-email feedback, and confirmation-email behavior.
- [ ] Confirm the signup redirect returns to the correct GitHub Pages traveler URL.
- [ ] Sign in with valid credentials; verify invalid credentials show a useful message.
- [ ] Refresh while signed in; verify session restoration and dashboard initialization.
- [ ] Sign out; press Back and refresh; verify private content is not exposed.
- [ ] Request password reset, open the email link, set a new password, and sign in with it.
- [ ] A sends a private message to B; verify it appears in A's conversation and B's inbox exactly once.
- [ ] B replies; verify A receives the reply and the inbox preview updates.
- [ ] Attempt to query another pair's private messages while signed in as a third test account; access must be denied by RLS.
- [ ] Verify a traveler cannot insert a private message with another user as sender.
- [ ] Verify profile visibility off removes the traveler from the shared directory after refresh.
- [ ] Verify each field's visibility toggle is honored; hidden fields must not appear to another account.
- [ ] Verify the Traveler Lounge loads, sends, receives realtime updates, and recovers from a temporary network interruption.
- [ ] Create a private journal entry as A; verify B cannot see it. Change it to shared; verify B can read it but cannot edit or delete it.
- [ ] Save a place as A; verify it persists after refresh and is not visible to B.
- [ ] Test account deletion in a disposable account and verify documented data-retention behavior.

## P1 — usability and recovery

- [ ] Verify message-send errors keep the draft and restore the send button.
- [ ] Verify sending a private message does not jump the page to the top.
- [ ] Test empty, long, Unicode, and multiline messages.
- [ ] Test journal create, edit, cancel edit, delete, private/shared visibility, and a 10,000-character boundary.
- [ ] Test saved-place URL validation, add/remove, long notes, and missing optional fields.
- [ ] Test all forms at 320px, 375px, tablet width, and desktop width.
- [ ] Test slow network, offline/reconnect, expired session, and database failure notices.
- [ ] Verify avatar sharing preferences and signed URL expiry behavior.
- [ ] Verify profile-save partial failures are recoverable and clearly reported.

## Security follow-up

- [x] Revoke direct EXECUTE from PUBLIC, anon, and authenticated for trigger-only SECURITY DEFINER functions `staylatin_mark_business_owner_after_submission()` and `staylatin_sync_admin_account_type()`.
- [ ] Enable leaked-password protection in Supabase Auth settings.
- [ ] Re-run Supabase security advisors after each security migration.
- [ ] Inspect storage bucket policies for traveler avatars.
- [ ] Verify no service-role key or secret is embedded in the static website.
- [ ] Review all table RLS policies with positive and negative tests.

## Feature rollout

Implemented in the traveler dashboard:
- [x] My Travel Journal — private by default; entries may be shared with signed-in travelers.
- [x] Saved Places — private shortlist with category, city, country, website, and notes.

Planned next:
- [ ] Travel Buddy Match — opt-in destination/date overlap and block/report controls.
- [ ] Collaborative Trip Planner — trip dates, itinerary, invitations, and checklist.
- [ ] City Circles — destination-specific discussions with moderation.
- [ ] Smart Arrival Checklist — user-managed arrival tasks with dated travel guidance.
- [ ] Traveler Activity & Notification Center — unified unread state for messages, invitations, and followed-city updates.

Do not mark a flow as passed until it has been tested in the live browser using separate accounts and database policies, not just the UI.
