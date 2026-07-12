(function () {
  const items = Array.isArray(window.KS_SITE_CONTENT) ? window.KS_SITE_CONTENT : [];

  const selectorKey = value => String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');

  const hideElement = element => {
    element.style.setProperty("display", "none", "important");
    element.setAttribute("data-ks-content-hidden", "true");
  };

  const showElement = element => {
    if (element.getAttribute("data-ks-content-hidden") === "true") {
      element.style.removeProperty("display");
      element.removeAttribute("data-ks-content-hidden");
    }
  };

  items.forEach(item => {
    const kind = String(item.kind || "Text");
    if (kind === "Banner") return;

    const key = selectorKey(item.key);
    const isActive = item.isActive !== false;

    if (kind === "Text") {
      document.querySelectorAll(`[data-content-key="${key}"]`).forEach(element => {
        if (!isActive) {
          hideElement(element);
          return;
        }
        showElement(element);
        element.textContent = item.value ?? "";
      });
    }

    if (kind === "Image") {
      document.querySelectorAll(`[data-content-image-key="${key}"]`).forEach(element => {
        const source = String(item.value || "").trim();
        if (!isActive || !source) {
          element.removeAttribute("src");
          hideElement(element);
          return;
        }

        showElement(element);
        element.src = source;
        if (item.altText) element.alt = item.altText;
      });
    }

    if (kind === "Link") {
      document.querySelectorAll(`[data-content-link-key="${key}"]`).forEach(element => {
        if (!isActive) {
          hideElement(element);
          return;
        }
        showElement(element);
        element.href = item.value || "#";
      });
    }
  });

  const currentFile = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const pageNames = {
    "index.html": "Start",
    "realizacje.html": "Realizacje",
    "o-nas.html": "O nas i proces",
    "proces.html": "O nas i proces",
    "wycena.html": "Wycena",
    "kontakt.html": "Kontakt",
    "krzywa_sosna_sklep.html": "Sklep",
    "sklep.html": "Sklep"
  };
  const currentPage = pageNames[currentFile] || "Start";
  const shell = document.querySelector("main.page .shell") || document.querySelector("main") || document.body;

  const bannerItems = items
    .filter(item => String(item.kind || "") === "Banner")
    .filter(item => item.isActive !== false)
    .filter(item => String(item.value || "").trim())
    .filter(item => {
      const page = String(item.page || "").trim();
      return !page || page === "Wszystkie" || page === "*" || page === currentPage;
    })
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));

  const originalFirstNode = shell.firstChild;
  let afterHeroAnchor = Array.from(shell.children).find(element => element.tagName === "SECTION") || null;

  const insertBanner = (banner, position) => {
    if (position === "Top") {
      shell.insertBefore(banner, originalFirstNode);
      return;
    }

    if (position === "BeforeFooter") {
      shell.append(banner);
      return;
    }

    if (afterHeroAnchor) {
      afterHeroAnchor.after(banner);
      afterHeroAnchor = banner;
    } else {
      shell.insertBefore(banner, originalFirstNode);
    }
  };

  bannerItems.forEach(item => {
    const key = String(item.key || "custom-banner");
    if (document.querySelector(`[data-ks-custom-banner-key="${selectorKey(key)}"]`)) return;

    const section = document.createElement("section");
    section.className = "ks-custom-banner reveal";
    section.setAttribute("data-ks-custom-banner-key", key);

    const image = document.createElement("img");
    image.src = item.value;
    image.alt = item.altText || item.label || "Baner";
    image.loading = "lazy";
    image.decoding = "async";

    const link = String(item.linkUrl || "").trim();
    if (link) {
      const anchor = document.createElement("a");
      anchor.href = link;
      anchor.className = "ks-custom-banner-link";
      if (/^https?:\/\//i.test(link)) {
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
      }
      anchor.append(image);
      section.append(anchor);
    } else {
      section.append(image);
    }

    insertBanner(section, String(item.position || "AfterHero"));
  });

  const s = window.KS_SITE_SETTINGS || {};
  const appearance = s.appearance || {};
  const root = document.documentElement;
  const number = (value, fallback, min, max) => {
    const parsed = Number(value);
    const safe = Number.isFinite(parsed) ? parsed : fallback;
    return Math.min(max, Math.max(min, safe));
  };
  const px = (name, value, fallback, min, max) => root.style.setProperty(name, number(value, fallback, min, max) + "px");
  px("--ks-logo-desktop", appearance.logoWidthDesktop, 500, 220, 700);
  px("--ks-logo-mobile", appearance.logoWidthMobile, 285, 120, 420);
  px("--ks-header-desktop", appearance.headerHeightDesktop, 112, 64, 180);
  px("--ks-header-mobile", appearance.headerHeightMobile, 86, 56, 140);
  px("--ks-font-body", appearance.bodyFontSize, 17, 12, 28);
  px("--ks-font-small", appearance.smallFontSize, 13, 9, 22);
  px("--ks-font-nav", appearance.navFontSize, 12, 9, 22);
  px("--ks-font-h1-desktop", appearance.h1FontSizeDesktop, 82, 38, 140);
  px("--ks-font-h1-mobile", appearance.h1FontSizeMobile, 47, 28, 90);
  px("--ks-font-h2", appearance.h2FontSize, 50, 24, 96);
  px("--ks-font-h3", appearance.h3FontSize, 27, 16, 60);
  px("--ks-font-button", appearance.buttonFontSize, 12, 9, 22);
  px("--ks-content-width", appearance.contentWidth, 1220, 760, 1800);
  px("--ks-section-desktop", appearance.sectionSpacingDesktop, 56, 16, 140);
  px("--ks-section-mobile", appearance.sectionSpacingMobile, 42, 14, 100);
  px("--ks-card-radius", appearance.cardRadius, 28, 0, 80);
  px("--ks-button-radius", appearance.buttonRadius, 999, 0, 999);
  root.style.setProperty("--ks-image-brightness", number(appearance.imageBrightnessPercent, 100, 35, 150) + "%");

  const digits = String(s.phone || "").replace(/\D/g, "");
  const phoneDigits = digits.startsWith("48") ? digits : "48" + digits;
  document.querySelectorAll('[data-setting-link="phone"]').forEach(a => a.href = "tel:+" + phoneDigits);
  document.querySelectorAll('[data-setting-link="whatsapp"]').forEach(a => {
    const old = a.getAttribute("href") || "";
    const text = old.includes("?") ? "?" + old.split("?").slice(1).join("?") : "";
    a.href = "https://wa.me/" + (s.whatsappNumber || "48578414690") + text;
  });
  document.querySelectorAll("[data-setting-area-block]").forEach(element => {
    const line1 = s.serviceArea || "";
    const line2 = s.phone ? "Telefon: " + s.phone : "";
    element.innerHTML = line1 + (line2 ? "<br>" + line2 : "");
  });
})();
