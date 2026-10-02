import type { Locale } from "@/content";

const DURATION = 2200;
const ALPHABETS = { ru: "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ", en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" };
const LAYOUT_SELECTOR = "header nav a, main a, main button, main article, main h1, main h2, main h3, main p, main li, main label, footer a, footer button";

export function captureLocaleLayout(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(LAYOUT_SELECTOR), (element) => ({
    element,
    parent: element.parentElement,
    index: Array.from(element.parentElement?.children ?? []).indexOf(element),
    rect: element.getBoundingClientRect(),
  }));
}

// Keep React's original text nodes intact. Only decorative, aria-hidden copies
// scramble; their stable word boxes prevent random glyphs from reflowing lines.
export function animateLocaleText(root: HTMLElement, locale: Locale, before: ReturnType<typeof captureLocaleLayout>, complete: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const animations: Animation[] = [];
  const restores: Array<() => void> = [];
  const words: Array<{ overlay: HTMLElement; box: HTMLElement; text: string; delay: number }> = [];
  const placeholders: Array<{ element: HTMLInputElement | HTMLTextAreaElement; text: string }> = [];
  let frame = 0;
  let finished = false;
  let timer = 0;

  const finish = () => {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    animations.forEach((animation) => animation.cancel());
    restores.forEach((restore) => restore());
    media.removeEventListener("change", finish);
    window.removeEventListener("resize", finish);
    document.removeEventListener("visibilitychange", onVisibility);
    complete();
  };
  const onVisibility = () => { if (document.hidden) finish(); };
  if (media.matches) {
    queueMicrotask(finish);
    return finish;
  }

  // Read all geometry before starting animations, including blocks below the
  // viewport: their heights affect the current scroll position.
  const after = before.flatMap(({ element, parent, index, rect }) => {
    const current = element.isConnected ? element : parent?.children.item(index);
    return current instanceof HTMLElement && current.isConnected
      ? [{ element: current, from: rect, to: current.getBoundingClientRect() }]
      : [];
  });
  for (const { element, from, to } of after) {
    if (!from.width || !to.width || (!Math.abs(from.width - to.width) && !Math.abs(from.height - to.height))) continue;
    animations.push(element.animate([
      { width: `${from.width}px`, height: `${from.height}px` },
      { width: `${to.width}px`, height: `${to.height}px` },
    ], { duration: DURATION, easing: "cubic-bezier(.22, 1, .36, 1)" }));
  }

  // Placeholders are attributes; animate the hints without touching the draft.
  for (const element of root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input[placeholder], textarea[placeholder]")) {
    const rect = element.getBoundingClientRect();
    if (element.value || rect.bottom <= 0 || rect.top >= innerHeight || !rect.width || !rect.height) continue;
    const text = element.placeholder;
    placeholders.push({ element, text });
    restores.push(() => { element.placeholder = text; });
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const parent = node.parentElement;
    if (!/\p{L}/u.test(node.data) || !parent || parent.closest('script, style, input, textarea, [data-locale], [role="dialog"]')) continue;
    const rect = parent.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= innerHeight || !rect.width || !rect.height || getComputedStyle(parent).visibility === "hidden") continue;
    nodes.push(node);
  }
  // Neutralize tag-based component rules (for example contact heading spans).
  // Temporary spans must inherit the exact typography of the original text.
  const createSpan = () => {
    const span = document.createElement("span");
    span.style.cssText = "font:inherit;color:inherit;letter-spacing:inherit;text-transform:inherit";
    return span;
  };
  for (const node of nodes) {
    const wrapper = createSpan();
    wrapper.dataset.localeScramble = "";
    if (node.parentElement?.closest("a, button")) wrapper.style.whiteSpace = "nowrap";
    node.replaceWith(wrapper);
    const original = createSpan();
    // The readable text remains available to assistive technology throughout.
    original.style.cssText += "position:absolute;clip-path:inset(50%);width:1px;height:1px;overflow:hidden;white-space:nowrap";
    original.append(node);
    wrapper.append(original);
    const visual = createSpan();
    visual.setAttribute("aria-hidden", "true");
    wrapper.append(visual);
    for (const token of node.data.split(/(\s+)/)) {
      if (!token.trim()) { visual.append(document.createTextNode(token)); continue; }
      const box = createSpan();
      box.style.cssText += "display:inline-block;position:relative;vertical-align:baseline";
      const sizing = createSpan();
      sizing.style.opacity = "0";
      sizing.textContent = token;
      const overlay = createSpan();
      overlay.style.cssText += "position:absolute;top:0;left:0;width:max-content;white-space:nowrap;transform-origin:left center";
      overlay.textContent = token;
      box.append(sizing, overlay);
      visual.append(box);
      words.push({ overlay, box, text: token, delay: Math.random() * 0.22 });
    }
    restores.push(() => wrapper.replaceWith(node));
  }
  const started = performance.now();
  let lastTick = -1;
  const tick = (now: number) => {
    const progress = Math.min(1, (now - started) / DURATION);
    const step = Math.floor((now - started) / 55);
    if (step !== lastTick) {
      lastTick = step;
      for (const { overlay, text, delay } of words) {
        const resolved = Math.max(0, (progress - 0.28 - delay) / (0.72 - delay));
        overlay.textContent = Array.from(text, (character, index) => {
          if (!/\p{L}/u.test(character) || index / text.length < resolved) return character;
          const alphabet = ALPHABETS[locale];
          const glyph = alphabet[Math.floor(Math.random() * alphabet.length)];
          return character === character.toLowerCase() ? glyph.toLowerCase() : glyph;
        }).join("");
      }
      for (const { element, text } of placeholders) {
        const resolved = Math.max(0, (progress - 0.28) / 0.72);
        element.placeholder = Array.from(text, (character, index) => {
          if (!/\p{L}/u.test(character) || index / text.length < resolved) return character;
          const alphabet = ALPHABETS[locale];
          const glyph = alphabet[Math.floor(Math.random() * alphabet.length)];
          return character === character.toLowerCase() ? glyph.toLowerCase() : glyph;
        }).join("");
      }
      // Random letters have different advances. Fit each decorative word to
      // its real text box instead of cutting off the last glyphs.
      const widths = words.map(({ overlay, box }) => ({ overlay, scale: box.offsetWidth / (overlay.offsetWidth || 1) }));
      for (const { overlay, scale } of widths) overlay.style.transform = `scaleX(${Math.min(1, scale)})`;
    }
    if (progress >= 1) finish();
    else frame = requestAnimationFrame(tick);
  };
  tick(started);
  // A backgrounded tab or a changed viewport must never leave temporary markup.
  timer = window.setTimeout(finish, DURATION + 150);
  media.addEventListener("change", finish);
  window.addEventListener("resize", finish);
  document.addEventListener("visibilitychange", onVisibility);
  return finish;
}
