/* StayLatin Traveler Toolkit — account-scoped local fallback plus optional private Supabase storage. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const escapeHtml=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const keys=["trip_planner","budget_tracker","documents_checklist","packing_checklist","currency_preferences","phrasebook_favorites","emergency_card"];
const defaults={
 trip_planner:{name:"",destination:"",start:"",end:"",days:[]},
 budget_tracker:{budget:"",currency:"USD",expenses:[]},
 documents_checklist:{items:[["Passport validity checked",false],["Visa / entry requirements checked",false],["Travel insurance arranged",false],["Flights or transport confirmed",false],["Accommodation confirmation saved",false],["Copies of key documents stored safely",false],["Medication and prescriptions prepared",false]]},
 packing_checklist:{items:[["Passport and travel documents",false],["Phone and charger",false],["Power adapter",false],["Payment cards and some cash",false],["Prescription medication",false],["Comfortable walking shoes",false],["Weather-appropriate clothing",false],["Toiletries and sunscreen",false]]},
 currency_preferences:{from:"USD",to:"COP",amount:"1"},
 phrasebook_favorites:{favorites:[]},
 emergency_card:{name:"",contact:"",relationship:"",phone:"",localNumber:"",insuranceContact:"",embassy:"",stayAddress:"",notes:""}
};
const state={};let cloudReady=false;let currentKey="";
function userKey(){return (window.activeTripUserId||"guest");}
function localKey(){return "staylatin-traveler-toolkit:"+userKey();}
function status(id,msg,error=false){const el=$(id);if(el){el.textContent=msg;el.style.color=error?"#a43d2e":"var(--muted)";}}
function clone(v){return JSON.parse(JSON.stringify(v));}
function readLocal(){try{return JSON.parse(localStorage.getItem(localKey())||"{}")||{};}catch(_){return {};}}
function writeLocal(){try{localStorage.setItem(localKey(),JSON.stringify(state));}catch(_){}}
async function db(){try{return typeof window.introClient==="function"?window.introClient():null;}catch(_){return null;}}
async function loadAll(){
 const local=readLocal();keys.forEach(k=>state[k]=Object.assign(clone(defaults[k]),local[k]||{}));
 const client=await db();
 if(client&&window.activeTripUserId){
  try{
   const {data,error}=await client.from("staylatin_traveler_tools").select("tool_key,payload").eq("user_id",window.activeTripUserId);
   if(!error){(data||[]).forEach(r=>{if(keys.includes(r.tool_key)&&r.payload&&typeof r.payload==="object")state[r.tool_key]=Object.assign(clone(defaults[r.tool_key]),r.payload);});cloudReady=true;writeLocal();}
  }catch(_){}
 }
 renderAll();
}
let saveTimers={};
async function save(k){
 writeLocal();
 const client=await db();
 if(client&&window.activeTripUserId){
  try{
   const {error}=await client.from("staylatin_traveler_tools").upsert({user_id:window.activeTripUserId,tool_key:k,payload:state[k],updated_at:new Date().toISOString()},{onConflict:"user_id,tool_key"});
   if(!error){cloudReady=true;status("toolkitStatus","Saved securely to your StayLatin account.");return;}
  }catch(_){}
 }
 status("toolkitStatus",window.activeTripUserId?"Saved on this device for this signed-in account. Cloud sync is waiting for the toolkit storage table.":"Saved on this device. Sign in to keep your tools with your traveler account.");
}
function renderAll(){renderTrip();renderBudget();renderChecklist("documents_checklist","documentItems","documentStatus");renderChecklist("packing_checklist","packingItems","packingStatus");renderEmergency();renderPhrasebook();renderCurrencySelectors();renderCurrency();}
function renderTrip(){
 const s=state.trip_planner;
 $("tripName").value=s.name||"";$("tripDestination").value=s.destination||"";$("tripStart").value=s.start||"";$("tripEnd").value=s.end||"";
 const box=$("tripDayList");if(!box)return;
 box.innerHTML=s.days.length?s.days.map((d,i)=>'<article class="tool-item"><div><b>'+escapeHtml(d.date||"Flexible date")+' · '+escapeHtml(d.title)+'</b><p>'+escapeHtml(d.note||"")+'</p></div><button type="button" class="tool-small danger" data-trip-delete="'+i+'">Remove</button></article>').join(""):'<p class="tool-empty">Add your first activity to build your day-by-day plan.</p>';
}
function renderBudget(){
 const s=state.budget_tracker;$("budgetLimit").value=s.budget??"";$("budgetCurrency").value=s.currency||"USD";
 const box=$("budgetExpenseList");if(!box)return;
 const planned=s.expenses.reduce((a,e)=>a+(Number(e.planned)||0),0),actual=s.expenses.reduce((a,e)=>a+(Number(e.actual)||0),0);
 $("budgetPlannedTotal").textContent=money(planned,s.currency);$("budgetActualTotal").textContent=money(actual,s.currency);
 const budget=Number(s.budget)||0;$("budgetRemaining").textContent=money(budget-actual,s.currency);
 box.innerHTML=s.expenses.length?s.expenses.map((e,i)=>'<article class="tool-item"><div><b>'+escapeHtml(e.title)+'</b><p>'+escapeHtml(e.category)+' · '+escapeHtml(e.currency)+' · Planned '+escapeHtml(e.planned)+' / Actual '+escapeHtml(e.actual)+'</p></div><button type="button" class="tool-small danger" data-expense-delete="'+i+'">Remove</button></article>').join(""):'<p class="tool-empty">No expenses yet. Planned and actual totals will appear here.</p>';
}
function money(n,c){try{return new Intl.NumberFormat(undefined,{style:"currency",currency:c||"USD",maximumFractionDigits:2}).format(Number(n)||0)}catch(_){return (Number(n)||0).toFixed(2)+" "+c;}}
function renderChecklist(key,boxId,statusId){
 const s=state[key],box=$(boxId);if(!box)return;
 box.innerHTML=s.items.map((it,i)=>'<label class="tool-check"><input type="checkbox" data-check-key="'+key+'" data-check-index="'+i+'" '+(it[1]?"checked":"")+'><span class="'+(it[1]?"done":"")+'">'+escapeHtml(it[0])+'</span><button type="button" class="tool-delete" aria-label="Remove '+escapeHtml(it[0])+'" data-check-delete="'+key+':'+i+'">×</button></label>').join("");
 const done=s.items.filter(i=>i[1]).length;status(statusId,done+" of "+s.items.length+" complete");
}
function renderEmergency(){const s=state.emergency_card;["name","contact","relationship","phone","localNumber","insuranceContact","embassy","stayAddress","notes"].forEach(k=>{const el=$("emergency_"+k);if(el)el.value=s[k]||"";});}
const phrases=[
["Hello","Hola"],["Good morning","Buenos días"],["Good afternoon","Buenas tardes"],["Good evening","Buenas noches"],["Please","Por favor"],["Thank you","Gracias"],["You're welcome","De nada"],["Excuse me","Disculpe"],["Do you speak English?","¿Habla inglés?"],["I speak a little Spanish","Hablo un poco de español"],["Could you help me?","¿Me puede ayudar?"],["Where is the bathroom?","¿Dónde está el baño?"],["How much does it cost?","¿Cuánto cuesta?"],["Can I pay by card?","¿Puedo pagar con tarjeta?"],["I would like water","Quisiera agua"],["The menu, please","La carta, por favor"],["Where is the bus station?","¿Dónde está la terminal de autobuses?"],["Please call a taxi","Por favor, llame un taxi"],["I need a doctor","Necesito un médico"],["I need help","Necesito ayuda"],["Call the police, please","Llame a la policía, por favor"],["I have a reservation","Tengo una reserva"],["Could I have the bill?","¿Me trae la cuenta?"],["I am allergic to…","Soy alérgico/a a…"],["Where is the nearest pharmacy?","¿Dónde está la farmacia más cercana?"]];
function renderPhrasebook(){
 const q=($("phraseSearch").value||"").toLowerCase(),fav=state.phrasebook_favorites.favorites;
 const rows=phrases.map((p,i)=>({p,i})).filter(x=>(x.p[0]+" "+x.p[1]).toLowerCase().includes(q));
 $("phraseList").innerHTML=rows.map(({p,i})=>'<article class="phrase-row"><div><div class="phrase-en">'+escapeHtml(p[0])+'</div><div class="phrase-es">'+escapeHtml(p[1])+'</div></div><button type="button" class="tool-small '+(fav.includes(i)?"selected":"")+'" data-phrase-fav="'+i+'">'+(fav.includes(i)?"♥ Saved":"♡ Save")+'</button></article>').join("")||'<p class="tool-empty">No phrases match that search.</p>';
}
let rates=null,rateDate="",rateLoading=false;
const currencyNames={USD:"US Dollar",EUR:"Euro",COP:"Colombian Peso",MXN:"Mexican Peso",BRL:"Brazilian Real",ARS:"Argentine Peso",CLP:"Chilean Peso",PEN:"Peruvian Sol",GBP:"British Pound",CAD:"Canadian Dollar",AUD:"Australian Dollar",NZD:"New Zealand Dollar",JPY:"Japanese Yen",CNY:"Chinese Yuan",INR:"Indian Rupee",CHF:"Swiss Franc",KRW:"South Korean Won",CRC:"Costa Rican Colón",DOP:"Dominican Peso",GTQ:"Guatemalan Quetzal",HNL:"Honduran Lempira",NIO:"Nicaraguan Córdoba",PAB:"Panamanian Balboa",UYU:"Uruguayan Peso",BOB:"Bolivian Boliviano",PYG:"Paraguayan Guaraní",VES:"Venezuelan Bolívar",PEN:"Peruvian Sol"};
function renderCurrencySelectors(){
 const list=Object.keys(rates||{}).sort();if(!list.length)return;
 ["currencyFrom","currencyTo"].forEach((id,idx)=>{const el=$(id),old=el.value|| (idx===0?state.currency_preferences.from:state.currency_preferences.to)|| (idx===0?"USD":"COP");el.innerHTML=list.map(c=>'<option value="'+c+'">'+c+' — '+escapeHtml(currencyNames[c]||c)+'</option>').join("");el.value=list.includes(old)?old:(idx===0?"USD":"COP");});
}
async function loadRates(){
 const cached=(()=>{try{return JSON.parse(localStorage.getItem("staylatin-fx-cache")||"null")}catch(_){return null}})();
 if(cached&&cached.at>Date.now()-6*60*60*1000){rates=cached.rates;rateDate=cached.date;renderCurrencySelectors();renderCurrency();return;}
 if(rateLoading)return;rateLoading=true;status("currencyStatus","Loading current exchange rates…");
 try{const response=await fetch("https://open.er-api.com/v6/latest/USD",{cache:"no-store"});if(!response.ok)throw new Error("Rates are temporarily unavailable.");const data=await response.json();if(data.result!=="success"||!data.rates)throw new Error("Rates are temporarily unavailable.");rates=data.rates;rateDate=data.time_last_update_utc||"latest update";try{localStorage.setItem("staylatin-fx-cache",JSON.stringify({at:Date.now(),rates,date:rateDate}));}catch(_){}renderCurrencySelectors();renderCurrency();status("currencyStatus","Exchange rates updated: "+rateDate+". Rates are indicative; your bank may use a different rate.");}
 catch(_){if(cached){rates=cached.rates;rateDate=cached.date;renderCurrencySelectors();renderCurrency();status("currencyStatus","Using the last saved rates ("+rateDate+"). Connect to the internet to refresh.",true);}else status("currencyStatus","Live rates could not load. Please try again when connected.",true);}
 finally{rateLoading=false;}
}
function renderCurrency(){
 if(!rates)return;
 const amount=Number($("currencyAmount").value),from=$("currencyFrom").value,to=$("currencyTo").value;
 if(!Number.isFinite(amount)){ $("currencyResult").textContent="Enter an amount.";return;}
 const a=rates[from],b=rates[to];if(!a||!b){$("currencyResult").textContent="Rate unavailable for this currency.";return;}
 const converted=amount/a*b;$("currencyResult").textContent=money(converted,to);
 $("currencyRate").textContent="1 "+from+" ≈ "+(b/a).toLocaleString(undefined,{maximumFractionDigits:6})+" "+to;
 state.currency_preferences={from,to,amount:String(amount)};writeLocal();
}
function bindForms(){
 $("tripDetailsForm").addEventListener("submit",async e=>{e.preventDefault();Object.assign(state.trip_planner,{name:$("tripName").value.trim(),destination:$("tripDestination").value.trim(),start:$("tripStart").value,end:$("tripEnd").value});await save("trip_planner");status("tripStatus","Trip details saved.");});
 $("tripDayForm").addEventListener("submit",async e=>{e.preventDefault();state.trip_planner.days.push({date:$("tripDayDate").value,title:$("tripDayTitle").value.trim(),note:$("tripDayNote").value.trim()});$("tripDayForm").reset();renderTrip();await save("trip_planner");status("tripStatus","Activity added to your itinerary.");});
 $("tripDayList").addEventListener("click",async e=>{const b=e.target.closest("[data-trip-delete]");if(!b)return;state.trip_planner.days.splice(Number(b.dataset.tripDelete),1);renderTrip();await save("trip_planner");});
 $("budgetDetailsForm").addEventListener("submit",async e=>{e.preventDefault();state.budget_tracker.budget=$("budgetLimit").value;state.budget_tracker.currency=$("budgetCurrency").value;await save("budget_tracker");renderBudget();status("budgetStatus","Budget settings saved.");});
 $("expenseForm").addEventListener("submit",async e=>{e.preventDefault();state.budget_tracker.expenses.push({title:$("expenseTitle").value.trim(),category:$("expenseCategory").value,currency:$("expenseCurrency").value,planned:Number($("expensePlanned").value)||0,actual:Number($("expenseActual").value)||0});$("expenseForm").reset();$("expenseCurrency").value=state.budget_tracker.currency||"USD";renderBudget();await save("budget_tracker");status("budgetStatus","Expense saved.");});
 $("budgetExpenseList").addEventListener("click",async e=>{const b=e.target.closest("[data-expense-delete]");if(!b)return;state.budget_tracker.expenses.splice(Number(b.dataset.expenseDelete),1);renderBudget();await save("budget_tracker");});
 ["documents_checklist","packing_checklist"].forEach(k=>{const box=$(k==="documents_checklist"?"documentItems":"packingItems");box.addEventListener("change",async e=>{const el=e.target.closest("[data-check-index]");if(!el)return;state[k].items[Number(el.dataset.checkIndex)][1]=el.checked;renderChecklist(k,k==="documents_checklist"?"documentItems":"packingItems",k==="documents_checklist"?"documentStatus":"packingStatus");await save(k);});box.addEventListener("click",async e=>{const b=e.target.closest("[data-check-delete]");if(!b)return;e.preventDefault();const [key,index]=b.dataset.checkDelete.split(":");state[key].items.splice(Number(index),1);renderChecklist(key,key==="documents_checklist"?"documentItems":"packingItems",key==="documents_checklist"?"documentStatus":"packingStatus");await save(key);});});
 $("addDocumentTask").addEventListener("click",async()=>{const v=$("newDocumentTask").value.trim();if(!v)return;state.documents_checklist.items.push([v,false]);$("newDocumentTask").value="";renderChecklist("documents_checklist","documentItems","documentStatus");await save("documents_checklist");});
 $("addPackingTask").addEventListener("click",async()=>{const v=$("newPackingTask").value.trim();if(!v)return;state.packing_checklist.items.push([v,false]);$("newPackingTask").value="";renderChecklist("packing_checklist","packingItems","packingStatus");await save("packing_checklist");});
 $("emergencyForm").addEventListener("submit",async e=>{e.preventDefault();["name","contact","relationship","phone","localNumber","insuranceContact","embassy","stayAddress","notes"].forEach(k=>state.emergency_card[k]=$("emergency_"+k).value.trim());await save("emergency_card");status("emergencyStatus","Emergency information saved on this device. For privacy, avoid storing passport numbers or insurance policy numbers.");});
 $("phraseSearch").addEventListener("input",renderPhrasebook);
 $("phraseList").addEventListener("click",async e=>{const b=e.target.closest("[data-phrase-fav]");if(!b)return;const i=Number(b.dataset.phraseFav),f=state.phrasebook_favorites.favorites;state.phrasebook_favorites.favorites=f.includes(i)?f.filter(x=>x!==i):f.concat(i);renderPhrasebook();await save("phrasebook_favorites");});
 ["currencyAmount","currencyFrom","currencyTo"].forEach(id=>$(id).addEventListener(id==="currencyAmount"?"input":"change",renderCurrency));
 $("swapCurrency").addEventListener("click",()=>{const a=$("currencyFrom").value;$("currencyFrom").value=$("currencyTo").value;$("currencyTo").value=a;renderCurrency();});
 $("refreshRates").addEventListener("click",async()=>{try{localStorage.removeItem("staylatin-fx-cache")}catch(_){}await loadRates();});
}
function init(){
 bindForms();loadAll().then(()=>{loadRates();const s=state.currency_preferences;$("currencyAmount").value=s.amount||"1";if(s.from)$("currencyFrom").value=s.from;if(s.to)$("currencyTo").value=s.to;renderCurrency();});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();