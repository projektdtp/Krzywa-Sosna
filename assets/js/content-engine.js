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

  const readSetting = (...keys) => {
    for (const key of keys) {
      const value = s[key];
      if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
    }
    return "";
  };

  const ownerName = readSetting("ownerName", "OwnerName", "contactName", "ContactName", "fullName", "FullName");
  const primaryPhone = readSetting("phone", "Phone");
  const secondaryPhone = readSetting("phone2", "Phone2", "secondaryPhone", "SecondaryPhone");
  const email = readSetting("email", "Email");
  const serviceArea = readSetting("serviceArea", "ServiceArea");
  const whatsappNumber = readSetting("whatsappNumber", "WhatsappNumber") || "48578414690";
  const footerSlogan = readSetting("footerSlogan", "FooterSlogan");
  const footerWatermarkEnabled = s.footerWatermarkEnabled !== false && s.FooterWatermarkEnabled !== false;
  const footerDecorativeLineEnabled = s.footerDecorativeLineEnabled !== false && s.FooterDecorativeLineEnabled !== false;
  const footerWatermarkOpacity = number(
    s.footerWatermarkOpacity ?? s.FooterWatermarkOpacity,
    12,
    0,
    30
  ) / 100;
  const footerHeight = number(
    s.footerHeight ?? s.FooterHeight,
    350,
    220,
    650
  );
  const footerHeightMobile = Math.max(190, Math.min(420, Math.round(footerHeight * 0.72)));
  const footerWatermarkSize = number(
    s.footerWatermarkSize ?? s.FooterWatermarkSize,
    510,
    180,
    900
  );
  root.style.setProperty("--ks-footer-watermark-opacity", String(footerWatermarkOpacity));
  root.style.setProperty("--ks-footer-height", footerHeight + "px");
  root.style.setProperty("--ks-footer-height-mobile", footerHeightMobile + "px");
  root.style.setProperty("--ks-footer-watermark-size", footerWatermarkSize + "px");

  document.querySelectorAll("[data-setting-footer-slogan]").forEach(element => {
    element.textContent = footerSlogan;
  });
  document.querySelectorAll(".site-footer-premium").forEach(footer => {
    footer.classList.toggle("footer-watermark-off", !footerWatermarkEnabled);
    footer.classList.toggle("footer-line-off", !footerDecorativeLineEnabled);
    footer.classList.toggle("footer-slogan-off", !footerSlogan);
  });
  document.querySelectorAll("[data-current-year]").forEach(element => {
    element.textContent = String(new Date().getFullYear());
  });

  const normalizePhone = value => {
    const digits = String(value || "").replace(/\D/g, "");
    if (!digits) return "";
    return digits.startsWith("48") ? digits : "48" + digits;
  };

  const primaryPhoneDigits = normalizePhone(primaryPhone);
  const secondaryPhoneDigits = normalizePhone(secondaryPhone);

  document.querySelectorAll('[data-setting-link="phone"]').forEach(a => {
    if (primaryPhoneDigits) a.href = "tel:+" + primaryPhoneDigits;
  });
  document.querySelectorAll('[data-setting-link="phone2"]').forEach(a => {
    if (secondaryPhoneDigits) a.href = "tel:+" + secondaryPhoneDigits;
  });
  document.querySelectorAll('[data-setting-link="email"]').forEach(a => {
    if (email) a.href = "mailto:" + email;
  });
  document.querySelectorAll('[data-setting-link="whatsapp"]').forEach(a => {
    const old = a.getAttribute("href") || "";
    const text = old.includes("?") ? "?" + old.split("?").slice(1).join("?") : "";
    a.href = "https://wa.me/" + whatsappNumber + text;
  });

  const iconMarkup = name => {
    const icons = {
      person: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"></circle><path d="M4.5 21a7.5 7.5 0 0 1 15 0"></path></svg>',
      location: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0z"></path><circle cx="12" cy="10" r="2.5"></circle></svg>',
      phone: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 3h3l1.2 4-2 1.5a15 15 0 0 0 6.3 6.3l1.5-2L21 14v3c0 2-2 4-4 4C9.3 20.2 3.8 14.7 3 7c0-2 2-4 4-4z"></path></svg>',
      mobile: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="7" y="2.5" width="10" height="19" rx="2"></rect><path d="M10 5h4M11 18.5h2"></path></svg>',
      email: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m4 7 8 6 8-6"></path></svg>'
    };
    return icons[name] || "";
  };

  const createIcon = name => {
    const icon = document.createElement("span");
    icon.className = "footer-contact-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = iconMarkup(name);
    return icon;
  };

  const appendTextItem = (container, text, iconName, extraClass = "") => {
    if (!String(text || "").trim()) return;
    const item = document.createElement("div");
    item.className = "footer-contact-item" + (extraClass ? " " + extraClass : "");
    item.append(createIcon(iconName));
    const value = document.createElement("span");
    value.textContent = String(text).trim();
    item.append(value);
    container.append(item);
  };

  const appendLinkItem = (container, value, href, iconName, ariaLabel) => {
    if (!String(value || "").trim()) return;
    const link = document.createElement("a");
    link.className = "footer-contact-item footer-contact-link";
    link.href = href;
    link.setAttribute("aria-label", ariaLabel + ": " + String(value).trim());
    link.title = ariaLabel;
    link.append(createIcon(iconName));
    const text = document.createElement("span");
    text.textContent = String(value).trim();
    link.append(text);
    container.append(link);
  };

  document.querySelectorAll("[data-setting-area-block]").forEach(element => {
    element.replaceChildren();
    element.className = "footer-contact";

    appendTextItem(element, ownerName, "person", "footer-owner");
    serviceArea.split(/\r?\n/).forEach(line => appendTextItem(element, line, "location"));
    if (primaryPhoneDigits) appendLinkItem(element, primaryPhone, "tel:+" + primaryPhoneDigits, "phone", "Telefon główny");
    if (secondaryPhoneDigits) appendLinkItem(element, secondaryPhone, "tel:+" + secondaryPhoneDigits, "mobile", "Drugi numer telefonu");
    if (email) appendLinkItem(element, email, "mailto:" + email, "email", "Adres e-mail");
  });
})();
