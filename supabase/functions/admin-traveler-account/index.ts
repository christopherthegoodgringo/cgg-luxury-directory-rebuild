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
  if (req.method !== "POST") return respond(405, { error: "Use POST." });
  const url = Deno.env.get("SUPABASE_URL"), anonKey = Deno.env.get("SUPABASE_ANON_KEY"), serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : authHeader.trim();
  if (!url || !anonKey || !serviceKey) return respond(500, { error: "Account management is not configured." });
  if (!token) return respond(401, { error: "Please sign in again." });
  const auth = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: authData, error: authError } = await auth.auth.getUser(token);
  const actor = authData?.user;
  if (authError || !actor) return respond(401, { error: "Your session is invalid or expired." });
  if (actor.app_metadata?.role !== "admin") return respond(403, { error: "Administrator permission is required." });
  let body: { action?: string; userIds?: string[]; targetUserId?: string; password?: string; confirmation?: string };
  try { body = await req.json(); } catch { return respond(400, { error: "Invalid request body." }); }
  const service = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const action = String(body.action || "");
  if (action === "lookupEmails") {
    const ids = [...new Set((body.userIds || []).map(String).filter(Boolean))].slice(0, 500);
    const results = await Promise.all(ids.map(async id => {
      const { data: profile, error: profileError } = await service.from("staylatin_profiles").select("id,account_type").eq("id", id).maybeSingle();
      if (profileError || !profile || profile.account_type !== "traveler") return null;
      const { data, error } = await service.auth.admin.getUserById(id);
      if (error || !data.user) return { id, email: "" };
      return { id, email: data.user.email || "" };
    }));
    return respond(200, { emails: Object.fromEntries(results.filter(Boolean).map((x: any) => [x.id, x.email])) });
  }
  const target = String(body.targetUserId || "");
  if (!target || target === actor.id) return respond(400, { error: "Choose a different traveler account." });
  const { data: profile, error: profileError } = await service.from("staylatin_profiles").select("id,account_type").eq("id", target).maybeSingle();
  if (profileError || !profile || profile.account_type !== "traveler") return respond(404, { error: "Traveler account not found." });
  const { data: authTarget, error: authTargetError } = await service.auth.admin.getUserById(target);
  if (authTargetError || !authTarget.user?.email) return respond(404, { error: "Traveler email address could not be verified." });
  if (action === "sendReset") {
    const { error } = await auth.auth.resetPasswordForEmail(authTarget.user.email, {
      redirectTo: "https://christopherthegoodgringo.github.io/cgg-luxury-directory-rebuild/staylatin/traveler.html?recovery=1"
    });
    if (error) return respond(500, { error: "Could not send a password-reset email. Check email delivery settings." });
    return respond(200, { success: true, message: "Password-reset email requested for " + authTarget.user.email + "." });
  }
  if (action === "setPassword") {
    const password = String(body.password || "");
    if (body.confirmation !== "SET PASSWORD") return respond(400, { error: "Confirmation text did not match." });
    if (password.length < 12 || password.length > 128) return respond(400, { error: "Use a password between 12 and 128 characters." });
    const { error } = await service.auth.admin.updateUserById(target, { password });
    if (error) return respond(500, { error: "Could not update the traveler's password." });
    return respond(200, { success: true, message: "Password updated for " + authTarget.user.email + ". Share the new password securely with the traveler." });
  }
  return respond(400, { error: "Unknown account-management action." });
});
