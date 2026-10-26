import { createClient } from "npm:@supabase/supabase-js@2";

const ADMIN_EMAIL = "christopher@christopherthegoodgringo.com";
const ALLOWED_ORIGIN = "https://christopherthegoodgringo.github.io";
const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

const listingFields = [
  "name", "slug", "category", "city", "country", "address", "description",
  "photo_url", "photo_urls", "official_url", "booking_url", "hostelworld_url",
  "expedia_url", "phone", "email", "whatsapp", "listing_tier", "status",
  "owner_first_name", "owner_last_name", "owner_role", "owner_email", "owner_whatsapp",
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  const origin = req.headers.get("Origin");
  if (origin && origin !== ALLOWED_ORIGIN) return reply({ error: "Origin not allowed" }, 403);

  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token || token === authHeader) return reply({ error: "Sign in required." }, 401);

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return reply({ error: "Server configuration incomplete." }, 500);

  const userClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  const user = userData?.user;
  if (userError || !user || (user.email || "").toLowerCase() !== ADMIN_EMAIL) {
    return reply({ error: "Administrator access denied." }, 403);
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const payload = await req.json().catch(() => ({}));
    const action = String(payload.action || "dashboard");

    if (action === "dashboard") {
      const [listings, submissions, claims, subscribers, audit, views, reviews, reports, associates, commissions, associateAudit, plans, memberships, transactions] = await Promise.all([
        admin.from("directory_listings").select("*").order("updated_at", { ascending: false }).limit(500),
        admin.from("listing_submissions").select("*").order("created_at", { ascending: false }).limit(200),
        admin.from("listing_claim_requests").select("*").order("created_at", { ascending: false }).limit(200),
        admin.from("traveler_subscribers").select("user_id,first_name,last_name,email,marketing_opt_in,marketing_opt_in_at,account_created_at,updated_at,member_status").order("account_created_at", { ascending: false }).limit(500),
        admin.from("directory_listing_audit").select("id,listing_id,listing_slug,action,old_record,new_record,changed_at").order("changed_at", { ascending: false }).limit(100),
        admin.from("directory_listing_views").select("listing_slug,view_count,updated_at").order("view_count", { ascending: false }).limit(100),
        admin.from("traveler_reviews").select("id,listing_slug,listing_name,city,country,rating,review_text,status,created_at,updated_at").order("created_at", { ascending: false }).limit(300),
        admin.from("traveler_chat_reports").select("id,reporter_id,message_id,reported_user_id,reason,details,admin_notes,status,created_at").order("created_at", { ascending: false }).limit(300),
        admin.from("independent_associates").select("*").order("created_at", { ascending: false }).limit(1000),
        admin.from("associate_commissions").select("*").order("earned_at", { ascending: false }).limit(2000),
        admin.from("independent_associate_audit").select("*").order("created_at", { ascending: false }).limit(200),
        admin.from("membership_plans").select("*").order("sort_order", { ascending: true }).limit(200),
        admin.from("traveler_memberships").select("*").order("updated_at", { ascending: false }).limit(1000),
        admin.from("membership_transactions").select("*").order("occurred_at", { ascending: false }).limit(2000),
      ]);
      for (const x of [listings, submissions, claims, subscribers, audit, views, reviews, reports, associates, commissions, associateAudit, plans, memberships, transactions]) if (x.error) throw x.error;
      return reply({
        ok: true,
        admin: { email: user.email },
        data: {
          listings: listings.data || [], submissions: submissions.data || [], claims: claims.data || [],
          subscribers: subscribers.data || [], audit: audit.data || [], views: views.data || [],
          reviews: reviews.data || [], reports: reports.data || [], associates: associates.data || [], commissions: commissions.data || [], associateAudit: associateAudit.data || [], plans: plans.data || [], memberships: memberships.data || [], transactions: transactions.data || [],
        },
      });
    }

    if (action === "update_listing") {
      const id = String(payload.id || "");
      const changes = payload.changes;
      if (!id || !changes || typeof changes !== "object" || Array.isArray(changes)) return reply({ error: "Listing id and changes are required." }, 400);
      const safe: Record<string, unknown> = {};
      for (const key of listingFields) if (Object.hasOwn(changes, key)) safe[key] = changes[key];
      if (!Object.keys(safe).length) return reply({ error: "No editable fields provided." }, 400);
      if (safe.category && !["Hotel", "Hostel", "Restaurant", "Bar"].includes(String(safe.category))) return reply({ error: "Invalid category." }, 400);
      if (safe.status && !["draft", "pending_approval", "active", "paused", "archived"].includes(String(safe.status))) return reply({ error: "Invalid listing status." }, 400);
      if (safe.listing_tier !== undefined && safe.listing_tier !== null && !["free", "featured", "premium"].includes(String(safe.listing_tier))) return reply({ error: "Invalid listing tier." }, 400);
      safe.updated_at = new Date().toISOString();
      const { data, error } = await admin.from("directory_listings").update(safe).eq("id", id).select("*").single();
      if (error) throw error;
      await admin.from("directory_listing_audit").insert({
        listing_id: data.id, listing_slug: data.slug, action: "update",
        new_record: { ...data, _admin_email: user.email, _source: "admin-studio" },
      });
      return reply({ ok: true, listing: data });
    }

    if (action === "review_submission") {
      const id = String(payload.id || "");
      const status = String(payload.status || "");
      if (!id || !["pending", "approved", "rejected"].includes(status)) return reply({ error: "Valid submission id and status are required." }, 400);
      const { data, error } = await admin.from("listing_submissions").update({
        status, review_notes: String(payload.review_notes || "").slice(0, 4000),
        reviewed_at: new Date().toISOString(), reviewed_by: user.email, updated_at: new Date().toISOString(),
      }).eq("id", id).select("*").single();
      if (error) throw error;
      return reply({ ok: true, submission: data });
    }

    if (action === "review_claim") {
      const id = String(payload.id || "");
      const status = String(payload.status || "");
      if (!id || !["pending", "approved", "rejected"].includes(status)) return reply({ error: "Valid claim id and status are required." }, 400);
      const { data, error } = await admin.from("listing_claim_requests").update({
        status, review_notes: String(payload.review_notes || "").slice(0, 4000),
        reviewed_at: new Date().toISOString(), reviewed_by: user.email,
      }).eq("id", id).select("*").single();
      if (error) throw error;
      return reply({ ok: true, claim: data });
    }



    if (action === "update_subscriber") {
      const userId=String(payload.user_id||""), changes=payload.changes;
      if(!userId||!changes||typeof changes!=="object"||Array.isArray(changes)) return reply({error:"Member id and changes are required."},400);
      const safe:Record<string,unknown>={}; for(const key of ["first_name","last_name","email","marketing_opt_in"]) if(Object.hasOwn(changes,key)) safe[key]=changes[key];
      if(typeof safe.email==="string"&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safe.email)) return reply({error:"Enter a valid email address."},400);
      if(!Object.keys(safe).length) return reply({error:"No editable member fields provided."},400);
      if(typeof safe.email==="string"){const {error:ae}=await admin.auth.admin.updateUserById(userId,{email:safe.email,email_confirm:true});if(ae)throw ae;}
      safe.updated_at=new Date().toISOString();
      const {data,error}=await admin.from("traveler_subscribers").update(safe).eq("user_id",userId).select("user_id,first_name,last_name,email,marketing_opt_in,marketing_opt_in_at,account_created_at,updated_at,member_status").single();
      if(error)throw error; return reply({ok:true,subscriber:data});
    }
    if (action === "set_subscriber_status") {
      const userId=String(payload.user_id||""), status=String(payload.status||"");
      if(!userId||!["pending","active","rejected"].includes(status))return reply({error:"Valid member id and status are required."},400);
      const {error:ae}=await admin.auth.admin.updateUserById(userId,{ban_duration:status==="active"?"none":"876000h"});if(ae)throw ae;
      const {data,error}=await admin.from("traveler_subscribers").update({member_status:status,updated_at:new Date().toISOString()}).eq("user_id",userId).select("user_id,first_name,last_name,email,marketing_opt_in,marketing_opt_in_at,account_created_at,updated_at,member_status").single();
      if(error)throw error;return reply({ok:true,subscriber:data});
    }
    if (action === "delete_subscriber_profile") {
      const userId=String(payload.user_id||"");if(!userId)return reply({error:"Member id is required."},400);
      const {error}=await admin.from("traveler_subscribers").delete().eq("user_id",userId);if(error)throw error;
      return reply({ok:true,removed:true,note:"Subscriber profile removed; Auth account was not deleted."});
    }
    if (action === "update_claim") {
      const id=String(payload.id||""), changes=payload.changes;
      if(!id||!changes||typeof changes!=="object"||Array.isArray(changes))return reply({error:"Claim id and changes are required."},400);
      const allowed=["listing_name","listing_location","owner_name","owner_role","owner_email","owner_phone","business_website","owner_message","owner_first_name","owner_last_name","business_category","business_address","business_description","business_phone","business_email","business_whatsapp","review_notes"];
      const safe:Record<string,unknown>={};for(const key of allowed)if(Object.hasOwn(changes,key))safe[key]=changes[key];
      if(!Object.keys(safe).length)return reply({error:"No editable claim fields provided."},400);
      const {data,error}=await admin.from("listing_claim_requests").update(safe).eq("id",id).select("*").single();if(error)throw error;return reply({ok:true,claim:data});
    }
    if (action === "delete_claim") {
      const id=String(payload.id||"");if(!id)return reply({error:"Claim id is required."},400);
      const {error}=await admin.from("listing_claim_requests").delete().eq("id",id);if(error)throw error;return reply({ok:true,removed:true});
    }
    if (action === "update_submission") {
      const id=String(payload.id||""), changes=payload.changes;
      if(!id||!changes||typeof changes!=="object"||Array.isArray(changes))return reply({error:"Submission id and changes are required."},400);
      const allowed=["name","category","city","country","address","description","photo_url","photo_urls","official_url","booking_url","hostelworld_url","expedia_url","phone","email","whatsapp","owner_first_name","owner_last_name","owner_role","owner_email","owner_whatsapp","submitted_by","review_notes"];
      const safe:Record<string,unknown>={};for(const key of allowed)if(Object.hasOwn(changes,key))safe[key]=changes[key];
      if(!Object.keys(safe).length)return reply({error:"No editable submission fields provided."},400);
      if(safe.category&&!["Hotel","Hostel","Restaurant","Bar"].includes(String(safe.category)))return reply({error:"Invalid category."},400);
      safe.updated_at=new Date().toISOString();const {data,error}=await admin.from("listing_submissions").update(safe).eq("id",id).select("*").single();if(error)throw error;return reply({ok:true,submission:data});
    }
    if (action === "delete_submission") {
      const id=String(payload.id||"");if(!id)return reply({error:"Submission id is required."},400);
      const {error}=await admin.from("listing_submissions").delete().eq("id",id);if(error)throw error;return reply({ok:true,removed:true});
    }
    if (action === "set_listing_status") {
      const id=String(payload.id||""),status=String(payload.status||"");
      if(!id||!["draft","pending_approval","active","paused","archived"].includes(status))return reply({error:"Valid listing id and status are required."},400);
      const {data:before}=await admin.from("directory_listings").select("*").eq("id",id).maybeSingle();if(!before)return reply({error:"Listing not found."},404);
      const {data,error}=await admin.from("directory_listings").update({status,updated_at:new Date().toISOString()}).eq("id",id).select("*").single();if(error)throw error;
      await admin.from("directory_listing_audit").insert({listing_id:data.id,listing_slug:data.slug,action:"update",old_record:before,new_record:{...data,_admin_email:user.email,_source:"admin-studio-status"}});
      return reply({ok:true,listing:data});
    }


    if (action === "create_associate" || action === "update_associate") {
      const id=String(payload.id||""),c=payload.changes;if(action==="update_associate"&&!id)return reply({error:"Associate id required."},400);if(!c||typeof c!=="object"||Array.isArray(c))return reply({error:"Associate details required."},400);
      const allowed=["full_name","email","phone","whatsapp","country","city","territory","referral_code","commission_rate","commission_basis","fixed_commission_amount","currency","status","start_date","end_date","agreement_status","agreement_signed_at","payment_method","payment_notes","internal_notes"];
      const s:Record<string,unknown>={};for(const k of allowed)if(Object.hasOwn(c,k))s[k]=c[k];if(!Object.keys(s).length)return reply({error:"No associate fields supplied."},400);
      if(typeof s.email==="string"&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email))return reply({error:"Valid email required."},400);
      if(s.commission_rate!==undefined&&(Number(s.commission_rate)<0||Number(s.commission_rate)>100))return reply({error:"Commission rate must be 0–100."},400);
      if(s.commission_basis!==undefined&&!["net_revenue","gross_revenue","fixed_per_conversion"].includes(String(s.commission_basis)))return reply({error:"Invalid commission basis."},400);
      if(s.status!==undefined&&!["pending","active","rejected","suspended","terminated"].includes(String(s.status)))return reply({error:"Invalid associate status."},400);
      if(s.agreement_status!==undefined&&!["not_signed","sent","signed","expired"].includes(String(s.agreement_status)))return reply({error:"Invalid agreement status."},400);
      if(s.fixed_commission_amount!==undefined&&s.fixed_commission_amount!==null&&Number(s.fixed_commission_amount)<0)return reply({error:"Fixed commission cannot be negative."},400);
      s.updated_at=new Date().toISOString();s.updated_by=user.email;
      if(action==="create_associate"){if(typeof s.full_name!=="string"||s.full_name.trim().length<2||!s.email||!s.referral_code)return reply({error:"Full name, email and referral code required."},400);if(s.status==="active"&&s.agreement_status!=="signed")return reply({error:"Mark the agreement signed before activation."},400);s.created_by=user.email;const {data,error}=await admin.from("independent_associates").insert(s).select("*").single();if(error)throw error;await admin.from("independent_associate_audit").insert({associate_id:data.id,action:"created",changed_by:user.email,details:{new_record:data}});return reply({ok:true,associate:data});}
      const {data:before,error:re}=await admin.from("independent_associates").select("*").eq("id",id).single();if(re)throw re;if(s.status==="active"&&(s.agreement_status??before.agreement_status)!=="signed")return reply({error:"Mark the agreement signed before activation."},400);const {data,error}=await admin.from("independent_associates").update(s).eq("id",id).select("*").single();if(error)throw error;await admin.from("independent_associate_audit").insert({associate_id:id,action:"updated",changed_by:user.email,details:{old_record:before,new_record:data}});return reply({ok:true,associate:data});
    }
    if (action === "set_associate_status") {
      const id=String(payload.id||""),status=String(payload.status||"");if(!id||!["pending","active","rejected","suspended","terminated"].includes(status))return reply({error:"Valid associate and status required."},400);const {data:before,error:re}=await admin.from("independent_associates").select("*").eq("id",id).single();if(re)throw re;if(status==="active"&&before.agreement_status!=="signed")return reply({error:"Mark the agreement signed before activation."},400);const {data,error}=await admin.from("independent_associates").update({status,updated_at:new Date().toISOString(),updated_by:user.email}).eq("id",id).select("*").single();if(error)throw error;await admin.from("independent_associate_audit").insert({associate_id:id,action:"status_"+status,changed_by:user.email,details:{old_status:before.status,new_status:status}});return reply({ok:true,associate:data});
    }
    if (action === "delete_associate") {
      const id=String(payload.id||"");if(!id)return reply({error:"Associate id required."},400);const {count,error:ce}=await admin.from("associate_commissions").select("id",{count:"exact",head:true}).eq("associate_id",id);if(ce)throw ce;if((count||0)>0)return reply({error:"This associate has commission history. Terminate instead; financial history is retained."},409);const {data:before,error:re}=await admin.from("independent_associates").select("*").eq("id",id).single();if(re)throw re;await admin.from("independent_associate_audit").insert({associate_id:id,action:"deleted",changed_by:user.email,details:{old_record:before}});const {error}=await admin.from("independent_associates").delete().eq("id",id);if(error)throw error;return reply({ok:true,removed:true});
    }
    if (action === "create_commission" || action === "update_commission") {
      const id=String(payload.id||""),c=payload.changes;if(action==="update_commission"&&!id)return reply({error:"Commission id required."},400);if(!c||typeof c!=="object"||Array.isArray(c))return reply({error:"Commission details required."},400);
      const allowed=["associate_id","transaction_reference","client_or_business","description","basis_amount","commission_amount","currency","status","earned_at","payment_reference","notes"];const s:Record<string,unknown>={};for(const k of allowed)if(Object.hasOwn(c,k))s[k]=c[k];
      if(action==="create_commission"){if(!s.associate_id||!s.transaction_reference)return reply({error:"Associate and unique transaction reference required."},400);const {data:a,error:ae}=await admin.from("independent_associates").select("*").eq("id",String(s.associate_id)).single();if(ae)throw ae;if(a.status!=="active")return reply({error:"Only active associates can earn new commission entries."},400);s.referral_code=a.referral_code;s.commission_basis=a.commission_basis;s.commission_rate=a.commission_rate;s.currency=a.currency;const basis=Number(s.basis_amount??0);if(basis<0)return reply({error:"Basis amount cannot be negative."},400);s.commission_amount=a.commission_basis==="fixed_per_conversion"?Number(a.fixed_commission_amount||0):Math.round(basis*Number(a.commission_rate)/100*100)/100;if(s.status!==undefined&&!["pending","approved","paid","void"].includes(String(s.status)))return reply({error:"Invalid commission status."},400);if(s.status==="paid")s.paid_at=new Date().toISOString();if(s.status==="approved")s.approved_at=new Date().toISOString();s.created_by=user.email;s.updated_by=user.email;s.updated_at=new Date().toISOString();const {data,error}=await admin.from("associate_commissions").insert(s).select("*").single();if(error)throw error;await admin.from("independent_associate_audit").insert({associate_id:a.id,commission_id:data.id,action:"commission_created",changed_by:user.email,details:{commission:data}});return reply({ok:true,commission:data});}
      const {data:before,error:re}=await admin.from("associate_commissions").select("*").eq("id",id).single();if(re)throw re;if(before.status==="paid"&&s.status!==undefined&&s.status!=="paid")return reply({error:"Paid commission status is locked to protect payout history."},409);if(before.status==="void"&&s.status!==undefined&&s.status!=="void")return reply({error:"Voided commission entries cannot be reactivated. Create a corrected entry instead."},409);if(s.status!==undefined&&!["pending","approved","paid","void"].includes(String(s.status)))return reply({error:"Invalid commission status."},400);if(s.status==="paid")s.paid_at=new Date().toISOString();if(s.status==="approved")s.approved_at=new Date().toISOString();s.updated_by=user.email;s.updated_at=new Date().toISOString();const {data,error}=await admin.from("associate_commissions").update(s).eq("id",id).select("*").single();if(error)throw error;await admin.from("independent_associate_audit").insert({associate_id:data.associate_id,commission_id:id,action:"commission_updated",changed_by:user.email,details:{old_record:before,new_record:data}});return reply({ok:true,commission:data});
    }
    if (action === "set_commission_status") {
      const id=String(payload.id||""),status=String(payload.status||"");if(!id||!["pending","approved","paid","void"].includes(status))return reply({error:"Valid commission and status required."},400);const {data:before,error:re}=await admin.from("associate_commissions").select("*").eq("id",id).single();if(re)throw re;if(before.status==="paid"&&status!=="paid")return reply({error:"Paid commission status is locked to protect payout history."},409);if(before.status==="void"&&status!=="void")return reply({error:"Voided commission entries cannot be reactivated. Create a corrected entry instead."},409);const u:Record<string,unknown>={status,updated_at:new Date().toISOString(),updated_by:user.email};if(status==="approved")u.approved_at=new Date().toISOString();if(status==="paid")u.paid_at=new Date().toISOString();const {data,error}=await admin.from("associate_commissions").update(u).eq("id",id).select("*").single();if(error)throw error;await admin.from("independent_associate_audit").insert({associate_id:data.associate_id,commission_id:id,action:"commission_"+status,changed_by:user.email,details:{old_status:before.status,new_status:status}});return reply({ok:true,commission:data});
    }
    if (action === "delete_commission") {
      const id=String(payload.id||"");if(!id)return reply({error:"Commission id required."},400);const {data:before,error:re}=await admin.from("associate_commissions").select("*").eq("id",id).single();if(re)throw re;if(before.status==="paid")return reply({error:"Paid commission records cannot be deleted."},409);await admin.from("independent_associate_audit").insert({associate_id:before.associate_id,commission_id:id,action:"commission_deleted",changed_by:user.email,details:{old_record:before}});const {error}=await admin.from("associate_commissions").delete().eq("id",id);if(error)throw error;return reply({ok:true,removed:true});
    }


    if (action === "save_membership_plan") {
      const id=String(payload.id||"").trim(),p=payload.plan;if(!p||typeof p!=="object"||Array.isArray(p))return reply({error:"Plan fields are required."},400);
      const code=String(p.code||"").trim().toLowerCase().replace(/[^a-z0-9_-]/g,"-").slice(0,60),name=String(p.name||"").trim().slice(0,120),audience=String(p.audience||"traveler"),status=String(p.status||"draft"),interval=String(p.billing_interval||"month"),price=Number(p.price),currency=String(p.currency||"USD").toUpperCase();
      if(!code||!name||!Number.isFinite(price)||price<0||!/^[A-Z]{3}$/.test(currency))return reply({error:"Enter plan code, name, valid non-negative price and 3-letter currency."},400);
      if(!["traveler","business_owner","both"].includes(audience)||!["draft","active","retired"].includes(status)||!["free","month","year","one_time"].includes(interval))return reply({error:"Invalid audience, status or interval."},400);
      const features=Array.isArray(p.features)?p.features.map((v:unknown)=>String(v).trim().slice(0,160)).filter(Boolean).slice(0,30):String(p.features||"").split("\n").map((v:string)=>v.trim().slice(0,160)).filter(Boolean).slice(0,30);
      const safe={code,name,audience,description:String(p.description||"").slice(0,2000),price,currency,billing_interval:interval,status,features,sort_order:Number.isFinite(Number(p.sort_order))?Math.trunc(Number(p.sort_order)):100,updated_at:new Date().toISOString(),updated_by:user.email};
      const q=id?admin.from("membership_plans").update(safe).eq("id",id):admin.from("membership_plans").insert(safe);const {data,error}=await q.select("*").single();if(error)throw error;return reply({ok:true,plan:data});
    }
    if (action === "delete_membership_plan") {
      const id=String(payload.id||"");if(!id)return reply({error:"Plan id required."},400);
      const {count,error:ce}=await admin.from("traveler_memberships").select("id",{count:"exact",head:true}).eq("plan_id",id);if(ce)throw ce;
      if((count||0)>0){const {error}=await admin.from("membership_plans").update({status:"retired",updated_at:new Date().toISOString(),updated_by:user.email}).eq("id",id);if(error)throw error;return reply({ok:true,retired:true});}
      const {error}=await admin.from("membership_plans").delete().eq("id",id);if(error)throw error;return reply({ok:true,removed:true});
    }
    if (action === "save_traveler_membership") {
      const id=String(payload.id||""),m=payload.membership;if(!m||typeof m!=="object"||Array.isArray(m))return reply({error:"Membership fields required."},400);
      const userId=String(m.user_id||""),planId=String(m.plan_id||""),status=String(m.status||"pending");if(!userId||!["pending","trialing","active","past_due","paused","cancelled","expired","comped"].includes(status))return reply({error:"Choose a traveler and valid status."},400);
      const {data:sub,error:se}=await admin.from("traveler_subscribers").select("user_id").eq("user_id",userId).maybeSingle();if(se)throw se;if(!sub)return reply({error:"Traveler member not found."},404);
      let planName=String(m.plan_name_snapshot||"").slice(0,120);if(planId){const {data:p,error:pe}=await admin.from("membership_plans").select("id,name,status").eq("id",planId).single();if(pe)throw pe;if(p.status==="retired"&&!id)return reply({error:"Cannot assign a retired plan."},400);planName=p.name;}
      const safe={user_id:userId,plan_id:planId||null,plan_name_snapshot:planName,status,starts_at:m.starts_at||new Date().toISOString(),ends_at:m.ends_at||null,cancel_at_period_end:Boolean(m.cancel_at_period_end),external_customer_id:String(m.external_customer_id||"").slice(0,200)||null,external_subscription_id:String(m.external_subscription_id||"").slice(0,200)||null,admin_notes:String(m.admin_notes||"").slice(0,4000),updated_at:new Date().toISOString(),updated_by:user.email};
      const q=id?admin.from("traveler_memberships").update(safe).eq("id",id):admin.from("traveler_memberships").insert(safe);const {data,error}=await q.select("*").single();if(error)throw error;return reply({ok:true,membership:data});
    }
    if (action === "set_traveler_membership_status") {
      const id=String(payload.id||""),status=String(payload.status||"");if(!id||!["pending","trialing","active","past_due","paused","cancelled","expired","comped"].includes(status))return reply({error:"Valid membership and status required."},400);
      const {data,error}=await admin.from("traveler_memberships").update({status,updated_at:new Date().toISOString(),updated_by:user.email}).eq("id",id).select("*").single();if(error)throw error;return reply({ok:true,membership:data});
    }
    if (action === "delete_traveler_membership") {
      const id=String(payload.id||"");if(!id)return reply({error:"Membership id required."},400);
      const {count,error:ce}=await admin.from("membership_transactions").select("id",{count:"exact",head:true}).eq("membership_id",id);if(ce)throw ce;if((count||0)>0)return reply({error:"Membership has transaction history; cancel or expire it instead."},409);
      const {error}=await admin.from("traveler_memberships").delete().eq("id",id);if(error)throw error;return reply({ok:true,removed:true});
    }
    if (action === "record_membership_transaction") {
      const t=payload.transaction;if(!t||typeof t!=="object"||Array.isArray(t))return reply({error:"Transaction fields required."},400);
      const userId=String(t.user_id||""),membershipId=String(t.membership_id||""),amount=Number(t.amount),currency=String(t.currency||"USD").toUpperCase(),status=String(t.status||"recorded"),type=String(t.transaction_type||"manual");
      if(!userId||!Number.isFinite(amount)||amount<0||!/^[A-Z]{3}$/.test(currency))return reply({error:"Choose a member and valid amount/currency."},400);
      if(!["recorded","pending","paid","failed","refunded","void"].includes(status)||!["manual","charge","refund","adjustment"].includes(type))return reply({error:"Invalid transaction status or type."},400);
      const {data:sub,error:se}=await admin.from("traveler_subscribers").select("user_id").eq("user_id",userId).maybeSingle();if(se)throw se;if(!sub)return reply({error:"Traveler member not found."},404);
      let planName=String(t.plan_name_snapshot||"").slice(0,120);if(membershipId){const {data:m,error:me}=await admin.from("traveler_memberships").select("id,user_id,plan_name_snapshot").eq("id",membershipId).single();if(me)throw me;if(m.user_id!==userId)return reply({error:"Transaction member must match membership owner."},400);planName=m.plan_name_snapshot||planName;}
      const safe={membership_id:membershipId||null,user_id:userId,plan_name_snapshot:planName,amount,currency,status,transaction_type:type,provider:String(t.provider||"manual").slice(0,80),provider_reference:String(t.provider_reference||"").slice(0,200)||null,occurred_at:new Date().toISOString(),notes:String(t.notes||"").slice(0,4000),created_by:user.email};
      const {data,error}=await admin.from("membership_transactions").insert(safe).select("*").single();if(error)throw error;return reply({ok:true,transaction:data});
    }
    if (action === "update_membership_transaction_status") {
      const id=String(payload.id||""),status=String(payload.status||"");if(!id||!["recorded","pending","paid","failed","refunded","void"].includes(status))return reply({error:"Valid transaction and status required."},400);
      const {data,error}=await admin.from("membership_transactions").update({status}).eq("id",id).select("*").single();if(error)throw error;return reply({ok:true,transaction:data});
    }


    if (action === "update_traveler_review") {
      const id=String(payload.id||""),changes=payload.changes;if(!id||!changes||typeof changes!=="object"||Array.isArray(changes))return reply({error:"Review id and editable fields required."},400);
      const safe:Record<string,unknown>={updated_at:new Date().toISOString()};if(Object.hasOwn(changes,"review_text"))safe.review_text=String(changes.review_text||"").slice(0,5000);
      if(Object.hasOwn(changes,"rating")){const rating=Number(changes.rating);if(!Number.isInteger(rating)||rating<1||rating>5)return reply({error:"Rating must be a whole number from 1 to 5."},400);safe.rating=rating;}
      if(Object.keys(safe).length===1)return reply({error:"No editable review fields provided."},400);
      const {data,error}=await admin.from("traveler_reviews").update(safe).eq("id",id).select("id,listing_slug,listing_name,city,country,rating,review_text,status,created_at,updated_at").single();if(error)throw error;return reply({ok:true,review:data});
    }
    if (action === "update_report_notes") {
      const id=String(payload.id||""),notes=String(payload.admin_notes||"").slice(0,4000);if(!id)return reply({error:"Report id required."},400);
      const {data,error}=await admin.from("traveler_chat_reports").update({admin_notes:notes}).eq("id",id).select("id,reason,details,admin_notes,status,created_at").single();if(error)throw error;return reply({ok:true,report:data});
    }
    if (action === "review_report") {
      const id = String(payload.id || "");
      const status = String(payload.status || "");
      if (!id || !["open", "reviewing", "resolved", "dismissed"].includes(status)) return reply({ error: "Valid report id and status are required." }, 400);
      const { data, error } = await admin.from("traveler_chat_reports").update({ status }).eq("id", id).select("id,status,reason,details,created_at").single();
      if (error) throw error;
      return reply({ ok: true, report: data });
    }

    if (action === "review_traveler_review") {
      const id = String(payload.id || "");
      const status = String(payload.status || "");
      if (!id || !["published", "hidden"].includes(status)) return reply({ error: "Valid review id and status are required." }, 400);
      const { data, error } = await admin.from("traveler_reviews").update({ status, updated_at: new Date().toISOString() }).eq("id", id).select("id,status,listing_slug,listing_name,created_at").single();
      if (error) throw error;
      return reply({ ok: true, review: data });
    }

    return reply({ error: "Unknown action." }, 400);
  } catch (err) {
    console.error("admin-studio-api error", err);
    return reply({ error: "The admin request could not be completed. Check database schema and function logs." }, 500);
  }
});