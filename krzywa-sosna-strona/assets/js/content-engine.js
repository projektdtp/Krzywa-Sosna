(function(){
  const items=window.KS_SITE_CONTENT||[];
  items.forEach(item=>{
    const key=String(item.key||"").replace(/"/g,'\\"');
    if(item.kind==="Text") document.querySelectorAll(`[data-content-key="${key}"]`).forEach(el=>el.textContent=item.value??"");
    if(item.kind==="Image") document.querySelectorAll(`[data-content-image-key="${key}"]`).forEach(el=>el.src=item.value??"");
    if(item.kind==="Link") document.querySelectorAll(`[data-content-link-key="${key}"]`).forEach(el=>el.href=item.value??"#");
  });
  const s=window.KS_SITE_SETTINGS||{};
  const digits=String(s.phone||"").replace(/\D/g,"");
  const phoneDigits=digits.startsWith('48')?digits:'48'+digits;
  document.querySelectorAll('[data-setting-link="phone"]').forEach(a=>a.href='tel:+'+phoneDigits);
  document.querySelectorAll('[data-setting-link="whatsapp"]').forEach(a=>{
    const old=a.getAttribute('href')||'';
    const text=old.includes('?')?'?'+old.split('?').slice(1).join('?'):'';
    a.href='https://wa.me/'+(s.whatsappNumber||'48578414690')+text;
  });
  document.querySelectorAll('[data-setting-area-block]').forEach(el=>{
    const line1=s.serviceArea||'';
    const line2=s.phone?'Telefon: '+s.phone:'';
    el.innerHTML=line1+(line2?'<br>'+line2:'');
  });
})();