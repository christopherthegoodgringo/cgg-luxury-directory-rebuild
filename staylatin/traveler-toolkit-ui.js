/* Traveler toolkit markup and styles. Rendered only on the signed-in traveler portal. */
(function(){
 if(document.getElementById("travelerToolkit"))return;
 const style=document.createElement("style");
 style.textContent=".toolkit,.journal-card{margin:26px 0;border:1px solid #cfe0d7;border-radius:14px;padding:clamp(15px,3vw,24px);background:linear-gradient(145deg,#fffdf8,#f1f8f2)}.toolkit-head h3,.journal-card h3{font:500 30px Georgia,serif;color:#173f35;margin:6px 0}.toolkit p,.journal-card>p{font-size:12px;color:#5a7268}.tool-grid{display:grid;grid-template-columns:minmax(0,1fr);grid-auto-rows:auto;align-items:stretch;gap:12px}.tool-card{min-width:0;min-height:520px;align-self:stretch;border:1px solid #d6e4d8;background:#fff;border-radius:10px;padding:14px}.tool-card.full{grid-column:1/-1;min-height:0}.tool-card h4{font:500 21px Georgia,serif;color:#173f35;margin:0 0 6px}.tool-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.tool-fields .wide{grid-column:1/-1}.tool-card label,.journal-card label{display:grid;gap:5px;font-size:11px;font-weight:800;color:#506056}.tool-card input:not([type=checkbox]),.tool-card select,.tool-card textarea,.journal-card input:not([type=hidden]),.journal-card select,.journal-card textarea{width:100%;min-width:0;border:1px solid #d7e2d8;background:#fffdf8;border-radius:7px;padding:9px;color:#1a2e28;font:inherit;font-size:13px}.tool-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.tool-button{border:0;border-radius:7px;padding:10px 12px;background:#173f35;color:#fff;font-weight:800;font-size:12px;cursor:pointer}.tool-button.secondary{background:#e7f1e8;color:#173f35;border:1px solid #cfe0d7}.tool-status{font-size:11px;color:#5a7268;margin:9px 0 0;min-height:16px}.tool-list{display:grid;gap:7px;margin-top:10px}.saved-trip-item .tool-actions{margin-top:0;justify-content:flex-end}.trip-picker-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin:10px 0 6px}.trip-picker-head strong{font:500 17px Georgia,serif;color:#173f35}.tool-item,.phrase-row{display:flex;justify-content:space-between;align-items:flex-start;gap:9px;border:1px solid #e0e9df;border-radius:8px;padding:9px;background:#fffdf8;min-width:0}.tool-item>div,.phrase-row>div{min-width:0;overflow-wrap:anywhere}.tool-item b,.phrase-en{font-size:13px;color:#173f35}.tool-item p{font-size:11px;margin:4px 0 0;white-space:pre-wrap}.tool-small,.tool-delete{border:1px solid #d5e3d7;border-radius:6px;padding:6px 8px;background:#e8f2e9;color:#173f35;font-weight:750;font-size:11px;cursor:pointer;flex-shrink:0}.tool-small.danger,.tool-delete{background:#fff0eb;color:#963f2c;border-color:#f1d4c8}.tool-small.selected{background:#173f35;color:white}.tool-check{display:flex!important;align-items:center;gap:9px!important;padding:8px;border-bottom:1px solid #edf1ea;font-size:12px!important;font-weight:600!important}.tool-check input{accent-color:#24785d}.tool-check span{flex:1}.tool-check .done{text-decoration:line-through;color:#7b8e82}.tool-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:12px 0}.tool-summary>div{padding:9px;border-radius:8px;background:#edf5ec;border:1px solid #d9e8d8;min-width:0}.tool-summary span{display:block;font-size:10px;color:#5a7268;font-weight:800}.tool-summary strong{display:block;color:#173f35;font-size:15px;overflow-wrap:anywhere}.currency-result{padding:14px;border-radius:10px;background:linear-gradient(120deg,#173f35,#2c7660);color:white;margin-top:12px}.currency-result small{display:block;color:#dce9df;font-size:11px}.currency-result strong{display:block;font:500 30px Georgia,serif;margin:3px 0}.phrase-es{font:500 18px Georgia,serif;color:#b86b45;margin-top:3px}.vault-item{align-items:center}.vault-preview{display:flex;align-items:center;gap:11px;min-width:0;flex:1}.vault-preview img{display:block;width:86px;height:86px;object-fit:cover;border-radius:8px;border:1px solid #d6e4d8;background:#f1f8f2}.vault-preview>div{min-width:0;overflow-wrap:anywhere}.vault-preview b{display:block}.vault-preview p{margin:4px 0 0}@media(max-width:760px){.tool-grid{grid-template-columns:minmax(0,1fr)}.tool-card.full{grid-column:auto}}@media(max-width:520px){.tool-fields{grid-template-columns:1fr}.tool-fields .wide{grid-column:auto}.tool-summary{grid-template-columns:1fr}}";
 style.textContent += `
/* Unified traveler portal typography and aligned tool cards */
#travelerToolkit .toolkit-head{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:nowrap}
#travelerToolkit .toolkit-head>.toolkit-main-toggle{align-self:center;flex:0 0 76px;width:76px;min-width:76px;height:34px}
#travelerToolkit .toolkit-head>.toolkit-intro{min-width:0;flex:1}
#travelerToolkit .toolkit-head .kicker{font:800 11px/1.3 system-ui,sans-serif;letter-spacing:.12em}\n#travelerToolkit .toolkit-head .toolkit-description{display:flex;align-items:center;min-height:34px;font:700 14px/1.35 system-ui,sans-serif;letter-spacing:0;text-transform:none;color:#173f35!important;margin:0;background:none;-webkit-background-clip:initial;background-clip:initial}
#travelerToolkit .toolkit-purpose{font:400 13px/1.6 system-ui,sans-serif;color:#5a7268;margin:0;max-width:760px}
#travelerToolkit .toolkit-head>.toolkit-main-toggle{display:inline-flex;align-items:center;justify-content:center;flex:0 0 76px;width:76px;min-width:76px;height:34px;margin:0 0 0 auto;padding:0 10px;border:1px solid #cfe0d7;border-radius:8px;background:linear-gradient(115deg,#0f3d32,#167b68,#239b86);color:#fff;font:800 11px/1 system-ui,sans-serif;white-space:nowrap;cursor:pointer;box-sizing:border-box}
#travelerToolkit .toolkit-head h3{display:none;font:700 17px/1.3 system-ui,sans-serif;margin:3px 0;color:#173f35}
#travelerToolkit .toolkit-head .tool-status{font:500 12px/1.35 system-ui,sans-serif;margin:0;min-height:0}

#travelerToolkit .tool-grid{grid-template-columns:minmax(0,1fr);grid-auto-rows:auto;align-items:stretch;gap:12px}
#travelerToolkit .tool-card{display:flex;flex-direction:column;min-width:0;min-height:0;height:auto;padding:16px;align-self:stretch}
#travelerToolkit .tool-card h4,#travelerToolkit .journal-card h3{display:flex;align-items:center;justify-content:space-between;gap:10px;min-width:0;font:700 14px/1.35 system-ui,sans-serif;color:#173f35;margin:0 0 10px}
#travelerToolkit .tool-card>p{font:400 12px/1.45 system-ui,sans-serif;margin:0 0 10px}
#travelerToolkit .tool-card .tool-list{min-width:0}
#travelerToolkit .tool-card .tool-actions{margin-top:auto;padding-top:10px}
#travelerToolkit .tool-collapse-toggle{display:inline-flex;align-items:center;justify-content:center;flex:0 0 76px;width:76px;min-width:76px;height:34px;margin:0 0 0 auto;padding:0 10px;border:1px solid #cfe0d7;border-radius:8px;background:linear-gradient(115deg,#0f3d32,#167b68,#239b86);color:#fff;font:800 11px/1 system-ui,sans-serif;white-space:nowrap;cursor:pointer}
#travelerToolkit .tool-card.full{grid-column:1/-1;min-height:0}
#travelerToolkit .tool-fields{align-content:start}
.community-collapse-heading{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;flex-wrap:nowrap!important}
.community-collapse-heading:not(h3):not(h4){font:700 14px/1.35 system-ui,sans-serif!important}
.community-collapse-heading>button.community-collapse-toggle{flex:0 0 76px!important;width:76px!important;min-width:76px!important;height:34px!important;padding:0 10px!important;font:800 11px/1 system-ui,sans-serif!important}
#travelerIntroductionsTitle,#travelerAccountSecurityTitle,#privateMessagingPanel h4,#chatTitle{font:700 14px/1.35 system-ui,sans-serif!important}
@media(max-width:760px){#travelerToolkit .tool-grid{grid-template-columns:minmax(0,1fr)}}
@media(max-width:540px){#travelerToolkit .tool-grid{grid-template-columns:minmax(0,1fr)}#travelerToolkit .tool-card.full{grid-column:auto}#travelerToolkit .toolkit-head{gap:8px}#travelerToolkit .toolkit-head h3{font-size:15px}#travelerToolkit .toolkit-purpose{font-size:12px;line-height:1.5}#travelerToolkit .toolkit-head>.toolkit-main-toggle{flex-basis:76px;width:76px;min-width:76px;height:34px}}
`;
 document.head.appendChild(style);
 const markup = `
<section id="travelerToolkit" class="toolkit"><div class="toolkit-head"><div class="toolkit-intro"><div class="kicker toolkit-description">Your personal travel tools</div><p class="toolkit-purpose">Use this space to prepare for trips and keep your travel essentials together. Store important documents, build packing checklists, convert currencies, practice Spanish phrases, save favorite stays, invite friends, and record your travel journal.</p></div></div><div class="tool-grid">
<section class="tool-card"><h4>1. Important Documents Vault</h4><p>Upload clear photos of important travel documents. Files are private to your signed-in account. Use only what you need, and avoid uploading documents you do not want stored online.</p><form id="documentVaultForm" class="tool-fields"><label>DOCUMENT TYPE<select id="vaultCategory"><option value="passport">Passport</option><option value="visa">Visa / entry permit</option><option value="photo-id">Photo ID / driving permit</option><option value="insurance">Travel insurance</option><option value="tickets">Flight / transport tickets</option><option value="accommodation">Hotel / accommodation confirmation</option><option value="health">Health / prescription documents</option><option value="emergency">Emergency information</option><option value="other">Other important document</option></select></label><label>ITEM LABEL<input id="vaultLabel" maxlength="90" required placeholder="e.g. Passport photo page"></label><label class="wide">PHOTO (JPG, PNG OR WEBP; MAX 5 MB)<input id="vaultPhoto" type="file" accept="image/jpeg,image/png,image/webp" required></label><div class="wide"><button id="vaultUploadButton" class="tool-button" type="submit">Upload photo securely</button></div></form><p id="vaultStatus" class="tool-status" role="status" aria-live="polite">Your vault is private and requires sign-in.</p><div id="documentVaultItems" class="tool-list"></div></section>
<section class="tool-card"><h4>2. Travel Documents Checklist</h4><p>Track preparation tasks here. Store document photos separately in your private vault above.</p><div id="documentItems" class="tool-list"></div><label>ADD A TASK<input id="newDocumentTask" maxlength="140"></label><button id="addDocumentTask" class="tool-button secondary" type="button">+ Add task</button><p id="documentStatus" class="tool-status" role="status"></p></section>
<section class="tool-card"><h4>3. Smart Packing Checklist</h4><p>Check off packing items and add your own.</p><div id="packingItems" class="tool-list"></div><label>ADD AN ITEM<input id="newPackingTask" maxlength="140" placeholder="Rain jacket"></label><button id="addPackingTask" class="tool-button secondary" type="button">+ Add item</button><p id="packingStatus" class="tool-status" role="status"></p></section>
<section class="tool-card"><h4>4. World Currency Converter</h4><p>Convert between supported currencies in either direction. Rates are indicative.</p><div class="tool-fields"><label class="wide">AMOUNT<input id="currencyAmount" type="number" min="0" step="any" value="1"></label><label>FROM<select id="currencyFrom"><option value="USD">USD</option></select></label><div style="display:flex;align-items:end"><button id="swapCurrency" type="button" class="tool-button secondary">⇄ Swap</button></div><label class="wide">TO<select id="currencyTo"><option value="COP">COP</option></select></label></div><div class="currency-result"><small>CONVERTED AMOUNT</small><strong id="currencyResult">Loading rates…</strong><small id="currencyRate">Latest available rate</small></div><button id="refreshRates" type="button" class="tool-button secondary">Refresh rates</button><p id="currencyStatus" class="tool-status" role="status" aria-live="polite">Loading rates…</p></section>
<section class="tool-card"><h4>5. Spanish Travel Phrasebook</h4><p>Search useful English and Spanish phrases, save favorites, and add your own phrases whenever you like.</p><form id="customPhraseForm" class="tool-fields"><label>ENGLISH PHRASE<input id="customPhraseEnglish" maxlength="180" required placeholder="Where is the hotel?"></label><label>SPANISH TRANSLATION<input id="customPhraseSpanish" maxlength="180" required placeholder="¿Dónde está el hotel?"></label><div class="wide"><button class="tool-button secondary" type="submit">+ Add my phrase</button></div></form><label>SEARCH PHRASES<input id="phraseSearch" placeholder="English or Spanish"></label><div id="phraseList" class="tool-list"></div><p id="phraseStatus" class="tool-status" role="status" aria-live="polite"></p></section>

<section id="travelerJournal" class="tool-card full journal-card"><div class="kicker" style="color:var(--terra)">Your private memories</div><h3>My Travel Journal</h3><p>Write and revisit personal memories. Entries are private unless you deliberately choose Shared entry. This is separate from public reviews and introductions.</p><form id="travelerJournalForm" class="tool-fields"><input id="journalEntryId" type="hidden"><label>ENTRY TITLE<input id="journalTitle" maxlength="120" required></label><label>DESTINATION<input id="journalDestination" maxlength="120"></label><label>DATE<input id="journalDate" type="date"></label><label>VISIBILITY<select id="journalVisibility"><option value="private">Private entry</option><option value="shared">Shared entry</option></select></label><label class="wide">YOUR MEMORY<textarea id="journalBody" maxlength="10000" rows="5" required></textarea></label><div class="wide tool-actions"><button id="journalSaveButton" class="tool-button">Save journal entry</button><button id="journalCancelEdit" class="tool-button secondary" type="button" hidden>Cancel edit</button></div></form><p id="journalStatus" class="tool-status" role="status"></p><div id="travelerJournalEntries" class="tool-list"></div></section>
</div></section>`;

 const anchor=document.getElementById("travelerIntroductions");
 if(anchor)anchor.insertAdjacentHTML("beforebegin",markup);
 /* The toolkit must exist before its main Open/Close control is attached. */
 const toolkitHead=document.querySelector("#travelerToolkit .toolkit-head");
 const toolkitGrid=document.querySelector("#travelerToolkit .tool-grid");
 if(toolkitHead&&toolkitGrid&&!toolkitHead.querySelector(".toolkit-main-toggle")){
   const toolkitButton=document.createElement("button");
   toolkitButton.type="button";
   toolkitButton.className="tool-collapse-toggle toolkit-main-toggle";
   toolkitButton.textContent="Open";
   toolkitButton.setAttribute("aria-expanded","false");
   toolkitButton.setAttribute("aria-label","Open personal travel tools");
   toolkitHead.appendChild(toolkitButton);
   const toolkitCollapseStyle=document.createElement("style");
   toolkitCollapseStyle.textContent="#travelerToolkit .tool-grid.toolkit-content-collapsed{display:none!important}#travelerToolkit .toolkit-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:nowrap}#travelerToolkit .toolkit-head>.toolkit-intro{min-width:0;flex:1}";
   document.head.appendChild(toolkitCollapseStyle);
   toolkitGrid.classList.add("toolkit-content-collapsed");
   toolkitButton.addEventListener("click",function(){
     const closed=toolkitGrid.classList.toggle("toolkit-content-collapsed");
     toolkitButton.textContent=closed?"Open":"Close";
     toolkitButton.setAttribute("aria-expanded",String(!closed));
     toolkitButton.setAttribute("aria-label",(closed?"Open":"Close")+" Your Travel Toolkit");
   });
 }
 /* Keep the existing live Favorites panel inside the toolkit so saved stays and booking links keep working. */
 const favorites=document.getElementById("travelerListingActions");
 const grid=document.querySelector("#travelerToolkit .tool-grid");
 const journal=document.getElementById("travelerJournal");
 if(grid&&journal){
  /* Keep My Travel Journal as a first-class, independently collapsible tool card. */
  journal.classList.add("tool-card");
  journal.classList.remove("full");
  const journalHeading=journal.querySelector("h3,h4");
  if(journalHeading){
    const title=document.createElement("h4");
    title.textContent="8. My Travel Journal";
    journalHeading.replaceWith(title);
  }
  if(journal.parentElement!==grid)grid.appendChild(journal);
 }
 if(favorites&&grid&&journal){
  /* Keep the existing saved-stays panel as its own tool card inside the same vertical toolkit. */
  favorites.className="tool-card";
  favorites.removeAttribute("style");
  favorites.setAttribute("aria-labelledby","travelerListingActionsTitle");
  const oldTitle=document.getElementById("travelerListingActionsTitle");
  if(oldTitle){
    const title=document.createElement("h4");
    title.id=oldTitle.id;
    title.textContent="6. Your Favorites";
    oldTitle.replaceWith(title);
  }
  grid.insertBefore(favorites,journal);
  favorites.insertAdjacentHTML("afterend",'<section class="tool-card"><h4>7. Invite Friends</h4><p>Invite friends to join you on StayLatin. Add their details and open a ready-to-send invitation in your email app.</p><form id="travelerInviteForm" class="tool-fields"><label>FRIEND\'S NAME<input id="inviteFriendName" maxlength="100" required placeholder="Friend\'s name"></label><label>FRIEND\'S EMAIL<input id="inviteFriendEmail" type="email" maxlength="254" required placeholder="friend@example.com"></label><label class="wide">PERSONAL MESSAGE (OPTIONAL)<textarea id="inviteFriendMessage" rows="3" maxlength="500" placeholder="I thought you might enjoy this travel portal!"></textarea></label><div class="wide"><button class="tool-button" type="submit">Prepare email invitation ↗</button></div></form><p id="travelerInviteStatus" class="tool-status" role="status" aria-live="polite">Your email app will open with the invitation. You review and send it yourself.</p></section>');
 }
 const inviteForm=document.getElementById("travelerInviteForm");
 if(inviteForm)inviteForm.addEventListener("submit",function(event){
  event.preventDefault();
  const name=document.getElementById("inviteFriendName").value.trim();
  const email=document.getElementById("inviteFriendEmail").value.trim();
  const personal=document.getElementById("inviteFriendMessage").value.trim();
  if(!name||!email){document.getElementById("travelerInviteStatus").textContent="Enter your friend's name and a valid email address.";return;}
  const subject="Join me on StayLatin";
  const portalUrl="https://christopherthegoodgringo.github.io/cgg-luxury-directory-rebuild/staylatin/traveler.html";
  const body="Hi "+name+",\\n\\n"+(personal?personal+"\\n\\n":"")+"I wanted to share StayLatin with you — a travel portal for discovering stays and keeping your travel plans together.\\n\\nJoin or sign in here: "+portalUrl+"\\n\\nHope to see you there!\\n\\nSent by a friend using StayLatin.";
  document.getElementById("travelerInviteStatus").textContent="Opening your email app. Review the invitation and press Send there.";
  window.location.href="mailto:"+encodeURIComponent(email)+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
 });
 /* Every toolkit section starts collapsed on each portal visit and can be opened independently. */
 const collapseStyle=document.createElement("style");
 collapseStyle.textContent=".tool-card>h4,.journal-card>h3{display:flex;align-items:center;justify-content:space-between;gap:12px}.tool-collapse-toggle{flex:0 0 auto;border:1px solid #cfe0d7;border-radius:999px;background:#edf5ec;color:#173f35;padding:7px 11px;font:700 11px/1.2 system-ui,sans-serif;cursor:pointer;white-space:nowrap}.tool-collapse-toggle:hover{background:#dcecdf}.tool-card-body,.journal-card-body{min-width:0}.tool-card.is-collapsed .tool-card-body,.journal-card.is-collapsed .journal-card-body{display:none}.tool-card.is-collapsed,.journal-card.is-collapsed{min-height:0}.tool-card.is-collapsed{height:auto}.tool-card.is-collapsed>h4{margin-bottom:0}.journal-card.is-collapsed>h3{margin-bottom:0}@media(prefers-reduced-motion:no-preference){.tool-collapse-toggle{transition:background .2s ease}}";
 document.head.appendChild(collapseStyle);
 function makeCollapsible(section,headingSelector){
   if(!section||section.dataset.collapsibleReady==="1")return;
   const heading=section.querySelector(":scope > "+headingSelector);if(!heading)return;
   const body=document.createElement("div");
   body.className=section.classList.contains("journal-card")?"journal-card-body":"tool-card-body";
   while(heading.nextSibling){body.appendChild(heading.nextSibling);}
   const button=document.createElement("button");
   button.type="button";button.className="tool-collapse-toggle";
   button.textContent="Open";button.setAttribute("aria-expanded","false");
   button.setAttribute("aria-label","Expand "+heading.textContent.trim());
   heading.appendChild(button);section.appendChild(body);
   section.classList.add("is-collapsed");section.dataset.collapsibleReady="1";
   button.addEventListener("click",function(){
     const collapsed=section.classList.toggle("is-collapsed");
     button.textContent=collapsed?"Open":"Close";
     button.setAttribute("aria-expanded",String(!collapsed));
     button.setAttribute("aria-label",(collapsed?"Expand ":"Collapse ")+heading.childNodes[0].textContent.trim());
   });
 }
 /* Final placement guard: both requested tools are direct children of the toolkit and retain their exact names. */
 const liveGrid=document.querySelector("#travelerToolkit .tool-grid");
 const liveJournal=document.getElementById("travelerJournal");
 const liveFavorites=document.getElementById("travelerListingActions");
 if(liveGrid&&liveJournal&&liveJournal.parentElement!==liveGrid)liveGrid.appendChild(liveJournal);
 if(liveGrid&&liveFavorites&&liveFavorites.parentElement!==liveGrid)liveGrid.insertBefore(liveFavorites,liveJournal||null);
 document.querySelectorAll("#travelerToolkit .tool-card").forEach(section=>makeCollapsible(section,"h4"));
 makeCollapsible(document.getElementById("travelerJournal"),"h3");
 /* Add the same independent Open/Close controls to the main traveler community panels. */
 const communityCollapseStyle=document.createElement("style");
 communityCollapseStyle.textContent=".community-collapse-heading{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:16px!important;flex-wrap:nowrap!important;width:100%;min-width:0;box-sizing:border-box}.community-collapse-heading>button.community-collapse-toggle{display:inline-flex!important;align-items:center!important;justify-content:center!important;flex:0 0 88px!important;width:88px!important;min-width:88px!important;height:36px!important;margin:0 0 0 auto!important;padding:0 12px!important;line-height:1!important;text-align:center!important;white-space:nowrap!important;box-sizing:border-box!important}.community-collapse-heading:not(h3):not(h4){margin-bottom:10px}.community-collapse-toggle{border:1px solid #cfe0d7;border-radius:9px;background:linear-gradient(115deg,#0f3d32,#167b68,#239b86);color:#fff;padding:7px 12px;font:800 11px/1.2 system-ui,sans-serif;cursor:pointer;white-space:nowrap;box-shadow:0 3px 9px #173f3518}.community-collapse-toggle:hover{filter:brightness(1.08)}#travelerIntroductionsTitle,#travelerAccountSecurityTitle,#privateMessagingPanel h4,#chatTitle{min-height:38px;line-height:1.2!important;margin-top:0!important;margin-bottom:8px!important}#travelerIntroductions,#travelerAccountSecurity,#privateMessagingPanel,#travelerLounge,.community-meet-panel{box-sizing:border-box;width:100%;min-width:0}#travelerIntroductions,#travelerAccountSecurity,#privateMessagingPanel,.community-meet-panel{border:1px solid #dce8dd!important;border-radius:12px!important;padding:18px!important;background:#fffdf8!important}#travelerLounge{border-top:1px solid #dce8dd!important;padding-top:18px!important}.community-collapse-body{min-width:0;box-sizing:border-box}.community-collapsed>.community-collapse-body{display:none!important}.community-collapsed{min-height:0!important}.community-collapsed>.community-collapse-heading{margin-bottom:0!important}#privateMessagingPanel>div:first-child{align-items:center!important}#privateMessagingPanel>div:first-child>div{flex:1;min-width:0}#privateMessagingPanel h4.community-collapse-heading{width:100%}#privateInboxList>button{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center!important;gap:12px!important;width:100%!important;min-width:0!important;text-align:left!important}#privateInboxList>button>span:first-child{min-width:0!important;overflow-wrap:anywhere!important}#privateInboxList>button>span:last-child{justify-self:end!important;white-space:nowrap!important}@media(max-width:520px){.community-collapse-heading{gap:8px!important}.community-collapse-heading>button.community-collapse-toggle{flex-basis:76px!important;width:76px!important;min-width:76px!important;height:34px!important}#travelerIntroductions,#travelerAccountSecurity,#privateMessagingPanel,.community-meet-panel{padding:13px!important}}";
 document.head.appendChild(communityCollapseStyle);
 function addCommunityCollapse(panel, heading, body){
   if(!panel||!heading||panel.dataset.communityCollapseReady==="1")return;
   const content=body||document.createElement("div");
   if(!body){
     content.className="community-collapse-body";
     const headerBlock=heading.parentElement!==panel?heading.parentElement:heading;
     let next=headerBlock.nextSibling;
     while(next){const after=next.nextSibling;content.appendChild(next);next=after;}
     panel.appendChild(content);
   }
   heading.classList.add("community-collapse-heading");
   const button=document.createElement("button");
   button.type="button";button.className="community-collapse-toggle";button.textContent="Open";
   button.setAttribute("aria-expanded","false");
   button.setAttribute("aria-label","Open "+heading.textContent.trim());
   heading.appendChild(button);
   panel.classList.add("community-collapsed");
   panel.dataset.communityCollapseReady="1";
   button.addEventListener("click",function(){
     const closed=panel.classList.toggle("community-collapsed");
     button.textContent=closed?"Open":"Close";
     button.setAttribute("aria-expanded",String(!closed));
     button.setAttribute("aria-label",(closed?"Open ":"Close ")+heading.childNodes[0].textContent.trim());
   });
 }
 addCommunityCollapse(document.getElementById("travelerAccountSecurity"),document.getElementById("travelerAccountSecurityTitle"));
 addCommunityCollapse(document.getElementById("travelerIntroductions"),document.getElementById("travelerIntroductionsTitle"));
 addCommunityCollapse(document.getElementById("privateMessagingPanel"),document.querySelector("#privateMessagingPanel h4"));
 addCommunityCollapse(document.getElementById("travelerLounge"),document.getElementById("chatTitle"));
 /* Keep Meet other travelers independent from the introduction profile form. */
 (function(){
   const root=document.getElementById("travelerIntroductions");
   const privatePanel=document.getElementById("privateMessagingPanel");
   const heading=[...document.querySelectorAll("#travelerIntroductions h4")].find(el=>el.textContent.trim()==="Meet other travelers");
   if(!root||!heading||!privatePanel||heading.closest(".community-meet-panel"))return;
   const start=heading.parentElement;
   const wrapper=document.createElement("div");
   wrapper.className="community-meet-panel";
   wrapper.style.cssText="margin-top:24px;border:1px solid #dce8dd;border-radius:12px;padding:14px;background:#fffdf8";
   const title=heading;
   const body=document.createElement("div");body.className="community-collapse-body";
   start.parentNode.insertBefore(wrapper,start);
   wrapper.appendChild(start);
   let node=start.nextSibling;
   while(node&&node!==privatePanel){
     const next=node.nextSibling;
     body.appendChild(node);
     node=next;
   }
   wrapper.appendChild(body);
   addCommunityCollapse(wrapper,title,body);
 })();

})();