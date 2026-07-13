(function () {
  "use strict";

  const grid = document.getElementById("realizationGrid");
  if (!grid) return;

  const filters = document.getElementById("realizationFilters");
  const emptyState = document.getElementById("realizationEmpty");
  const modal = document.getElementById("realizationModal");
  const modalImage = document.getElementById("realizationModalImage");
  const modalCategory = document.getElementById("realizationModalCategory");
  const modalTitle = document.getElementById("realizationModalTitle");
  const modalDescription = document.getElementById("realizationModalDescription");
  const modalFacts = document.getElementById("realizationFacts");
  const thumbs = document.getElementById("realizationThumbs");
  const counter = document.getElementById("realizationCounter");
  const prevButton = document.getElementById("realizationPrev");
  const nextButton = document.getElementById("realizationNext");

  let realizations = [];
  let activeFilter = "Wszystkie";
  let currentRealization = null;
  let currentImages = [];
  let currentImageIndex = 0;
  let lastFocusedElement = null;
  let touchStartX = 0;

  const text = value => String(value || "").trim();
  const imagePath = value => text(value).replace(/^\/+/, "");

  function create(tag, className, content) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content !== undefined && content !== null) element.textContent = content;
    return element;
  }

  function photoLabel(count) {
    if (count === 1) return "1 zdjęcie";
    if (count >= 2 && count <= 4) return `${count} zdjęcia`;
    return `${count} zdjęć`;
  }

  function normalizeRealization(item, index) {
    const sourceImages = Array.isArray(item.images) ? item.images : [];
    const images = sourceImages
      .filter(image => image && text(image.fileName))
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
      .map((image, imageIndex) => ({
        fileName: imagePath(image.fileName),
        altText: text(image.altText) || text(item.title) || "Realizacja Krzywej Sosny",
        isCover: Boolean(image.isCover),
        sortOrder: Number(image.sortOrder || imageIndex + 1)
      }));

    const coverIndex = Math.max(0, images.findIndex(image => image.isCover));
    if (images.length && coverIndex > 0) {
      const [cover] = images.splice(coverIndex, 1);
      images.unshift(cover);
    }

    return {
      id: text(item.id) || `realization-${index + 1}`,
      title: text(item.title) || "Realizacja",
      category: text(item.category) || "Inne",
      shortDescription: text(item.shortDescription),
      description: text(item.description) || text(item.shortDescription),
      scope: text(item.scope),
      duration: text(item.duration),
      budget: text(item.budget),
      location: text(item.location),
      badge: text(item.badge),
      isFeatured: Boolean(item.isFeatured),
      isActive: item.isActive !== false,
      sortOrder: Number(item.sortOrder || index + 1),
      images
    };
  }

  async function getData() {
    if (Array.isArray(window.KS_REALIZATIONS)) return window.KS_REALIZATIONS;

    try {
      const response = await fetch("realizacje.json", { cache: "no-store" });
      if (response.ok) return await response.json();
    } catch (_) {
      // Podgląd lokalny może blokować fetch; realizacje.js pozostaje źródłem podstawowym.
    }

    return [];
  }

  function renderFilters() {
    if (!filters) return;
    filters.replaceChildren();

    const categories = [
      "Wszystkie",
      ...Array.from(new Set(realizations.map(item => item.category))).sort((a, b) => a.localeCompare(b, "pl"))
    ];

    categories.forEach(category => {
      const button = create("button", "realization-filter", category);
      button.type = "button";
      button.dataset.filter = category;
      button.classList.toggle("active", category === activeFilter);
      button.addEventListener("click", () => {
        activeFilter = category;
        filters.querySelectorAll(".realization-filter").forEach(item => {
          item.classList.toggle("active", item === button);
        });
        renderCards();
      });
      filters.appendChild(button);
    });
  }

  function renderCards() {
    grid.replaceChildren();

    const visible = realizations.filter(item =>
      activeFilter === "Wszystkie" || item.category === activeFilter
    );

    if (emptyState) emptyState.hidden = visible.length > 0;
    if (!visible.length) return;

    const hasFeatured = visible.some(item => item.isFeatured);

    visible.forEach((item, index) => {
      const card = create("article", "realization-wow-card reveal");
      const isLead = item.isFeatured || (!hasFeatured && index === 0);
      if (isLead) card.classList.add("is-featured");
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `Otwórz realizację: ${item.title}`);

      const visual = create("div", "realization-card-visual");
      const cover = item.images[0];
      if (cover) {
        const image = document.createElement("img");
        image.src = cover.fileName;
        image.alt = cover.altText;
        image.loading = index < 2 ? "eager" : "lazy";
        image.decoding = "async";
        visual.appendChild(image);
      } else {
        visual.classList.add("no-image");
      }

      const top = create("div", "realization-card-top");
      if (item.badge) top.appendChild(create("span", "realization-card-badge", item.badge));
      if (item.images.length) {
        const count = create("span", "realization-photo-count", photoLabel(item.images.length));
        count.setAttribute("aria-label", photoLabel(item.images.length));
        top.appendChild(count);
      }
      visual.appendChild(top);

      const overlay = create("div", "realization-card-overlay");
      overlay.appendChild(create("div", "realization-card-category", item.category));
      overlay.appendChild(create("h3", "", item.title));
      if (item.shortDescription) overlay.appendChild(create("p", "", item.shortDescription));
      const action = create("div", "realization-card-action");
      action.appendChild(create("span", "", "Zobacz realizację"));
      action.appendChild(create("span", "realization-card-arrow", "↗"));
      overlay.appendChild(action);
      visual.appendChild(overlay);
      card.appendChild(visual);

      const open = () => openModal(item, card);
      card.addEventListener("click", open);
      card.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      });

      grid.appendChild(card);
      requestAnimationFrame(() => card.classList.add("visible"));
    });
  }

  function addFact(label, value, icon) {
    if (!value || !modalFacts) return;
    const fact = create("div", "realization-fact");
    fact.appendChild(create("span", "realization-fact-icon", icon));
    const copy = create("div", "");
    copy.appendChild(create("small", "", label));
    copy.appendChild(create("strong", "", value));
    fact.appendChild(copy);
    modalFacts.appendChild(fact);
  }

  function openModal(item, sourceElement) {
    if (!modal || !modalImage) return;

    currentRealization = item;
    currentImages = item.images.slice();
    currentImageIndex = 0;
    lastFocusedElement = sourceElement || document.activeElement;

    modalCategory.textContent = item.category;
    modalTitle.textContent = item.title;
    modalDescription.textContent = item.description || item.shortDescription;
    modalFacts.replaceChildren();
    addFact("Zakres prac", item.scope, "✦");
    addFact("Czas realizacji", item.duration, "◷");
    addFact("Wycena", item.budget, "◇");
    addFact("Lokalizacja", item.location, "⌖");

    renderThumbs();
    showImage(0);

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("realization-modal-open");
    modal.querySelector(".realization-modal-close")?.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("realization-modal-open");
    currentRealization = null;
    currentImages = [];
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") lastFocusedElement.focus();
  }

  function renderThumbs() {
    if (!thumbs) return;
    thumbs.replaceChildren();
    thumbs.hidden = currentImages.length <= 1;

    currentImages.forEach((image, index) => {
      const button = create("button", "realization-thumb");
      button.type = "button";
      button.setAttribute("aria-label", `Pokaż zdjęcie ${index + 1}`);
      const picture = document.createElement("img");
      picture.src = image.fileName;
      picture.alt = "";
      picture.loading = "lazy";
      picture.decoding = "async";
      button.appendChild(picture);
      button.addEventListener("click", () => showImage(index));
      thumbs.appendChild(button);
    });
  }

  function showImage(index) {
    if (!modalImage) return;

    if (!currentImages.length) {
      modalImage.removeAttribute("src");
      modalImage.alt = currentRealization?.title || "Realizacja";
      counter.textContent = "Brak zdjęć";
      prevButton.hidden = true;
      nextButton.hidden = true;
      return;
    }

    currentImageIndex = (index + currentImages.length) % currentImages.length;
    const image = currentImages[currentImageIndex];
    modalImage.classList.remove("image-ready");
    modalImage.src = image.fileName;
    modalImage.alt = image.altText;
    modalImage.onload = () => modalImage.classList.add("image-ready");
    counter.textContent = `${currentImageIndex + 1} / ${currentImages.length}`;

    const single = currentImages.length <= 1;
    prevButton.hidden = single;
    nextButton.hidden = single;

    thumbs?.querySelectorAll(".realization-thumb").forEach((thumb, thumbIndex) => {
      thumb.classList.toggle("active", thumbIndex === currentImageIndex);
      thumb.setAttribute("aria-current", thumbIndex === currentImageIndex ? "true" : "false");
    });
  }

  function previousImage() { showImage(currentImageIndex - 1); }
  function nextImage() { showImage(currentImageIndex + 1); }

  document.querySelectorAll("[data-realization-close]").forEach(element => {
    element.addEventListener("click", closeModal);
  });
  prevButton?.addEventListener("click", previousImage);
  nextButton?.addEventListener("click", nextImage);

  document.addEventListener("keydown", event => {
    if (!modal?.classList.contains("open")) return;
    if (event.key === "Escape") closeModal();
    if (event.key === "ArrowLeft") previousImage();
    if (event.key === "ArrowRight") nextImage();
  });

  const stage = modal?.querySelector(".realization-stage");
  stage?.addEventListener("touchstart", event => {
    touchStartX = event.changedTouches[0]?.clientX || 0;
  }, { passive: true });
  stage?.addEventListener("touchend", event => {
    const endX = event.changedTouches[0]?.clientX || 0;
    const difference = endX - touchStartX;
    if (Math.abs(difference) < 45) return;
    if (difference > 0) previousImage();
    else nextImage();
  }, { passive: true });

  getData().then(data => {
    realizations = (Array.isArray(data) ? data : [])
      .map(normalizeRealization)
      .filter(item => item.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, "pl"));

    renderFilters();
    renderCards();
  });
})();
