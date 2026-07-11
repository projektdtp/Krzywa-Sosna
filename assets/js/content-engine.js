(function(){
  const items=window.KS_SITE_CONTENT||[];
  items.forEach(item=>{
    const key=String(item.key||"").replace(/"/g,'\\"');
    if(item.kind==="Text") document.querySelectorAll(`[data-content-key="${key}"]`).forEach(el=>el.textContent=item.value??"");
    if(item.kind==="Image") document.querySelectorAll(`[data-content-image-key="${key}"]`).forEach(el=>el.src=item.value??"");
    if(item.kind==="Link") document.querySelectorAll(`[data-content-link-key="${key}"]`).forEach(el=>el.href=item.value??"#");
  });
  const s=window.KS_SITE_SETTINGS||{};
  const appearance=s.appearance||{};
  const root=document.documentElement;
  const number=(value,fallback,min,max)=>{
    const parsed=Number(value);
    const safe=Number.isFinite(parsed)?parsed:fallback;
    return Math.min(max,Math.max(min,safe));
  };
  const px=(name,value,fallback,min,max)=>root.style.setProperty(name,number(value,fallback,min,max)+'px');
  px('--ks-logo-desktop',appearance.logoWidthDesktop,500,220,700);
  px('--ks-logo-mobile',appearance.logoWidthMobile,285,120,420);
  px('--ks-header-desktop',appearance.headerHeightDesktop,112,64,180);
  px('--ks-header-mobile',appearance.headerHeightMobile,86,56,140);
  px('--ks-font-body',appearance.bodyFontSize,17,12,28);
  px('--ks-font-small',appearance.smallFontSize,13,9,22);
  px('--ks-font-nav',appearance.navFontSize,12,9,22);
  px('--ks-font-h1-desktop',appearance.h1FontSizeDesktop,82,38,140);
  px('--ks-font-h1-mobile',appearance.h1FontSizeMobile,47,28,90);
  px('--ks-font-h2',appearance.h2FontSize,50,24,96);
  px('--ks-font-h3',appearance.h3FontSize,27,16,60);
  px('--ks-font-button',appearance.buttonFontSize,12,9,22);
  px('--ks-content-width',appearance.contentWidth,1220,760,1800);
  px('--ks-section-desktop',appearance.sectionSpacingDesktop,56,16,140);
  px('--ks-section-mobile',appearance.sectionSpacingMobile,42,14,100);
  px('--ks-card-radius',appearance.cardRadius,28,0,80);
  px('--ks-button-radius',appearance.buttonRadius,999,0,999);
  root.style.setProperty('--ks-image-brightness',number(appearance.imageBrightnessPercent,100,35,150)+'%');
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