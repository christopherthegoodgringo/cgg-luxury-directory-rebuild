import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://christopherthegoodgringo.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function respond(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return respond(405, { error: "Use POST for account deletion." });

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\\s+/i, "").trim();
  if (!url || !anonKey || !serviceKey) return respond(500, { error: "Account deletion is not configured on the server." });
  if (!token) return respond(401, { error: "Sign in again before deleting an account." });

  let body: { targetUserId?: string; mode?: string; confirmation?: string };
  try { body = await req.json(); } catch { return respond(400, { error: "Invalid request body." }); }
  const targetUserId = String(body.targetUserId || "");
  const mode = String(body.mode || "");
  if (!targetUserId || !["self", "admin"].includes(mode) || body.confirmation !== "DELETE") {
    return respond(400, { error: "Confirm deletion by entering DELETE." });
  }

  const authClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  const actor = authData?.user;
  if (authError || !actor) return respond(401, { error: "Your session is invalid or expired. Sign in again." });
  if (mode === "self" && actor.id !== targetUserId) return respond(403, { error: "You can only delete your own account." });
  if (mode === "admin" && actor.app_metadata?.role !== "admin") return respond(403, { error: "Administrator permission is required." });
  if (mode === "admin" && actor.id === targetUserId) return respond(400, { error: "Use the traveler account deletion option to delete your own account." });

  const service = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: profile, error: profileError } = await service
    .from("staylatin_profiles").select("id,account_type").eq("id", targetUserId).maybeSingle();
  if (profileError) return respond(500, { error: "Could not verify the traveler profile." });
  if (profile && profile.account_type !== "traveler") return respond(403, { error: "Only traveler accounts can be deleted here." });
  if (!profile && mode === "admin") return respond(404, { error: "Traveler profile was not found." });
  if (!profile && mode === "self" && actor.user_metadata?.intended_account_type !== "traveler") {
    return respond(403, { error: "This deletion option is only available to traveler accounts." });
  }

  const { data: ownedBusinesses, error: businessError } = await service
    .from("staylatin_businesses").select("id").eq("owner_id", targetUserId).limit(1);
  if (businessError) return respond(500, { error: "Could not check account ownership. No changes were made." });
  if (ownedBusinesses?.length) return respond(409, { error: "This account owns a business listing. Transfer or remove that listing before deleting the traveler account." });

  // Reviews use a restrictive foreign key, so remove authored reviews before deleting the account.
  // Other account-linked data follows the database's existing cascade / SET NULL rules.
  const { error: reviewsError } = await service.from("staylatin_reviews").delete().eq("author_id", targetUserId);
  if (reviewsError) return respond(500, { error: "Could not prepare this account for deletion. No account was deleted." });

  const { error: deleteError } = await service.auth.admin.deleteUser(targetUserId);
  if (deleteError) return respond(500, { error: "The account could not be deleted. Contact support if this continues." });
  return respond(200, { success: true, message: mode === "self" ? "Your StayLatin traveler account has been deleted." : "The traveler account has been deleted." });
});
