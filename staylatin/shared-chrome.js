(function(){
  var languageOrder=["en","es","pt"];
  var languageLabels={en:"EN",es:"ES",pt:"PT"};
  var languageNames={en:"English",es:"Español",pt:"Português"};
  var language="en";
  try{var saved=localStorage.getItem("staylatin-lang");if(languageOrder.indexOf(saved)>=0)language=saved;}catch(e){}
  function applyLanguage(){
    document.documentElement.lang=language;
    document.querySelectorAll("[data-en]").forEach(function(el){
      var val=el.getAttribute("data-"+language); if(val!==null) el.textContent=val;
    });
    document.querySelectorAll("[data-en-placeholder]").forEach(function(el){
      var val=el.getAttribute("data-"+language+"-placeholder"); if(val!==null) el.placeholder=val;
    });
    var btn=document.getElementById("language");
    if(btn){
      btn.textContent=(languageLabels[language]||language.toUpperCase())+" ▾";
      btn.setAttribute("aria-label","Language: "+(languageNames[language]||language));
    }
    var menu=document.getElementById("languageMenu");
    if(menu){
      menu.querySelectorAll("[data-lang]").forEach(function(li){
        li.setAttribute("aria-selected", li.getAttribute("data-lang")===language ? "true" : "false");
      });
    }
    try{localStorage.setItem("staylatin-lang",language);}catch(e){}
  }
  function closeLangMenu(){
    var btn=document.getElementById("language");
    var menu=document.getElementById("languageMenu");
    if(menu){menu.hidden=true;menu.classList.remove("is-open");}
    if(btn)btn.setAttribute("aria-expanded","false");
  }
  function openLangMenu(){
    var btn=document.getElementById("language");
    var menu=document.getElementById("languageMenu");
    if(menu){menu.hidden=false;menu.classList.add("is-open");}
    if(btn)btn.setAttribute("aria-expanded","true");
  }
  function bind(){
    var btn=document.getElementById("language");
    var menu=document.getElementById("languageMenu");
    if(!btn||!menu||btn.dataset.slLangBound) return;
    btn.dataset.slLangBound="1";
    btn.addEventListener("click",function(e){
      e.preventDefault(); e.stopPropagation();
      if(menu.hidden) openLangMenu(); else closeLangMenu();
    });
    menu.addEventListener("click",function(e){
      e.stopPropagation();
      var li=e.target.closest("[data-lang]"); if(!li) return;
      language=li.getAttribute("data-lang");
      closeLangMenu(); applyLanguage();
      if(typeof window.stayLatinOnLanguageChange==="function"){
        try{window.stayLatinOnLanguageChange(language);}catch(err){}
      }
    });
    document.addEventListener("click",function(e){ if(!e.target.closest(".sl-lang-wrap")) closeLangMenu(); });
    document.addEventListener("keydown",function(e){ if(e.key==="Escape") closeLangMenu(); });
    applyLanguage();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",bind);
  else bind();
})();
