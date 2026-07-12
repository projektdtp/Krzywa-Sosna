(function () {
  "use strict";

  const campaigns = Array.isArray(window.KS_POPUPS) ? window.KS_POPUPS : [];
  if (!campaigns.length) return;

  const params = new URLSearchParams(window.location.search);
  const previewId = params.get("ksPopupPreview");
  const currentPage = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  const now = new Date();

  function normalizeTime(value, fallback) {
    return /^\d{1,2}:\d{2}$/.test(String(value || "")) ? String(value) : fallback;
  }

  function scheduleDate(dateValue, timeValue, isEnd) {
    if (!dateValue) return null;
    const raw = String(dateValue).slice(0, 10);
    const time = normalizeTime(timeValue, isEnd ? "23:59" : "00:00");
    const date = new Date(`${raw}T${time}:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function matchesSchedule(item) {
    const start = scheduleDate(item.startDate, item.startTime, false);
    const end = scheduleDate(item.endDate, item.endTime, true);
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  }

  function matchesPage(item) {
    if (item.showOnAllPages) return true;
    const map = {
      "index.html": item.showOnHome,
      "": item.showOnHome,
      "realizacje.html": item.showOnRealizations,
      "o-nas.html": item.showOnAbout,
      "proces.html": item.showOnProcess,
      "wycena.html": item.showOnQuote,
      "krzywa_sosna_sklep.html": item.showOnShop,
      "sklep.html": item.showOnShop,
      "kontakt.html": item.showOnContact
    };
    return Boolean(map[currentPage]);
  }

  function storageKey(item) {
    return `ks_popup_${item.id || "campaign"}`;
  }

  function getStorage(item) {
    return item.frequency === "session" ? window.sessionStorage : window.localStorage;
  }

  function mayShowByFrequency(item) {
    if (item.frequency === "everyVisit") return true;
    try {
      const raw = getStorage(item).getItem(storageKey(item));
      if (!raw) return true;
      if (item.frequency === "once" || item.frequency === "session") return false;
      const last = Number(raw);
      if (!Number.isFinite(last)) return true;
      const elapsed = Date.now() - last;
      if (item.frequency === "daily") return elapsed >= 24 * 60 * 60 * 1000;
      if (item.frequency === "weekly") return elapsed >= 7 * 24 * 60 * 60 * 1000;
      return true;
    } catch (_) {
      return true;
    }
  }

  function markShown(item) {
    if (item.frequency === "everyVisit") return;
    try {
      const value = (item.frequency === "once" || item.frequency === "session") ? "1" : String(Date.now());
      getStorage(item).setItem(storageKey(item), value);
    } catch (_) {}
  }

  function htmlEscape(text) {
    return String(text || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function showPopup(item, forcePreview) {
    const overlay = document.createElement("div");
    overlay.className = "popup ks-campaign-popup";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", item.name || "Komunikat");

    const target = item.openLinkInNewTab ? ' target="_blank" rel="noopener"' : "";
    const image = item.imageFileName
      ? `<img src="${htmlEscape(item.imageFileName)}" alt="${htmlEscape(item.imageAlt || item.name)}">`
      : "";
    const linkedImage = item.linkUrl && image
      ? `<a class="ks-popup-image-link" href="${htmlEscape(item.linkUrl)}"${target}>${image}</a>`
      : image;
    const heading = item.heading ? `<h2>${htmlEscape(item.heading)}</h2>` : "";
    const description = item.description ? `<p>${htmlEscape(item.description)}</p>` : "";
    const cta = item.linkUrl && item.buttonText
      ? `<a class="btn primary ks-popup-cta" href="${htmlEscape(item.linkUrl)}"${target}>${htmlEscape(item.buttonText)}</a>`
      : "";
    const copy = heading || description || cta
      ? `<div class="ks-popup-copy">${heading}${description}${cta}</div>`
      : "";

    overlay.innerHTML = `
      <div class="popup-bg" data-ks-popup-close></div>
      <div class="popup-card ks-popup-card" style="--ks-popup-width:${Math.max(280, Number(item.maxWidth || 610))}px">
        <button aria-label="Zamknij" class="popup-close" data-ks-popup-close type="button">×</button>
        ${linkedImage}
        ${copy}
        <div class="popup-foot"><button data-ks-popup-close type="button">${htmlEscape(item.closeText || "Zamknij")}</button></div>
      </div>`;

    document.body.appendChild(overlay);
    document.body.classList.add("ks-popup-open");
    requestAnimationFrame(() => overlay.classList.add("show"));
    if (!forcePreview) markShown(item);

    function close() {
      overlay.classList.remove("show");
      document.body.classList.remove("ks-popup-open");
      window.setTimeout(() => overlay.remove(), 180);
    }

    overlay.querySelectorAll("[data-ks-popup-close]").forEach(el => el.addEventListener("click", close));
    overlay.querySelectorAll("a").forEach(el => el.addEventListener("click", () => {
      if (!forcePreview) markShown(item);
    }));
    document.addEventListener("keydown", function escapeHandler(event) {
      if (event.key !== "Escape") return;
      document.removeEventListener("keydown", escapeHandler);
      close();
    });
  }

  let selected = null;
  let forcePreview = false;

  if (previewId) {
    selected = campaigns.find(item => String(item.id) === previewId) || null;
    forcePreview = Boolean(selected);
  }

  if (!selected) {
    selected = campaigns
      .filter(item => item && item.isActive !== false)
      .filter(matchesSchedule)
      .filter(matchesPage)
      .filter(mayShowByFrequency)
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))[0] || null;
  }

  if (!selected) return;
  const delay = forcePreview ? 100 : Math.max(0, Number(selected.delayMs || 0));
  window.setTimeout(() => showPopup(selected, forcePreview), delay);
})();
