
(function () {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));

  // reveal
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
  }, {threshold:.08});
  $$(".reveal").forEach(el => observer.observe(el));

  // tabs
  $$(".tabs").forEach(tabs => {
    const target = tabs.dataset.tabs;
    tabs.addEventListener("click", e => {
      const btn = e.target.closest("[data-tab]");
      if (!btn) return;
      $$(".tab-btn", tabs).forEach(x => x.classList.toggle("active", x === btn));
      $$(`[data-tab-pane]`, document).forEach(p => {
        if (p.closest(`#${target}`)) p.classList.toggle("active", p.dataset.tabPane === btn.dataset.tab);
      });
    });
  });

  // accordion — delegacja obsługuje również pytania dodawane z Managera
  document.addEventListener("click", e => {
    const btn = e.target.closest(".accordion-button");
    if (!btn) return;
    const item = btn.closest(".accordion-item");
    if (!item) return;
    const isOpen = item.classList.toggle("open");
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // modal generic
  const modal = $("#detailModal");
  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    document.body.classList.remove("modal-open");
  }
  $$("[data-modal-close]").forEach(el => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

  $$("[data-project]").forEach(card => {
    card.addEventListener("click", () => {
      if (!modal) return;
      $("#modalImage").src = card.dataset.image;
      $("#modalImage").alt = card.dataset.title;
      $("#modalKicker").textContent = card.dataset.category;
      $("#modalTitle").textContent = card.dataset.title;
      $("#modalDescription").textContent = card.dataset.description;
      $("#modalDetails").innerHTML = `
        <li><strong>Zakres:</strong> ${card.dataset.scope}</li>
        <li><strong>Czas realizacji:</strong> ${card.dataset.time}</li>
        <li><strong>Budżet orientacyjny:</strong> ${card.dataset.budget}</li>`;
      modal.classList.add("open");
      document.body.classList.add("modal-open");
    });
  });


  // brief -> WhatsApp
  const brief = $("#briefForm");
  if (brief) {
    brief.addEventListener("submit", e => {
      e.preventDefault();
      const data = new FormData(brief);
      const msg = [
        "Dzień dobry, przesyłam krótki opis planowanej zabudowy:",
        `Rodzaj: ${data.get("type") || "-"}`,
        `Miejscowość: ${data.get("city") || "-"}`,
        `Wymiary: ${data.get("dimensions") || "-"}`,
        `Planowany budżet: ${data.get("budget") || "-"}`,
        `Opis: ${data.get("description") || "-"}`
      ].join("\n");
      window.open("https://wa.me/48578414690?text=" + encodeURIComponent(msg), "_blank");
    });
  }
})();
