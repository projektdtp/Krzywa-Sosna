(function () {
  const root = document.querySelector("[data-faq-list]");
  if (!root) return;

  const source = Array.isArray(window.KS_FAQS) ? window.KS_FAQS : [];
  const items = source
    .filter(item => item && item.isActive !== false && String(item.question || "").trim() && String(item.answer || "").trim())
    .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));

  root.innerHTML = "";

  if (!items.length) {
    const section = root.closest("section");
    if (section) section.hidden = true;
    return;
  }

  items.forEach((item, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "accordion-item";

    const button = document.createElement("button");
    button.className = "accordion-button";
    button.type = "button";
    button.setAttribute("aria-expanded", "false");

    const question = document.createElement("span");
    question.textContent = String(item.question || "Pytanie");

    const sign = document.createElement("span");
    sign.textContent = "+";
    sign.setAttribute("aria-hidden", "true");

    const content = document.createElement("div");
    content.className = "accordion-content";
    content.textContent = String(item.answer || "");
    content.id = "faq-answer-" + index;

    button.setAttribute("aria-controls", content.id);
    button.append(question, sign);
    wrapper.append(button, content);
    root.append(wrapper);
  });
})();
