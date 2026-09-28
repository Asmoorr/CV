type Phase = "idle" | "exiting" | "waiting" | "entering";

type Transition = {
  source: string;
  target: string;
  overlay: HTMLDivElement;
  reducedMotion: boolean;
  timeout: number;
  onAbort: () => void;
};

const listeners = new Set<(phase: Phase) => void>();
let phase: Phase = "idle";
let active: Transition | null = null;

function publish(next: Phase) {
  phase = next;
  listeners.forEach((listener) => listener(next));
}

function preventScroll(event: Event) {
  event.preventDefault();
}

function preventScrollKeys(event: KeyboardEvent) {
  if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
    event.preventDefault();
  }
}

function blockScroll() {
  window.addEventListener("wheel", preventScroll, { capture: true, passive: false });
  window.addEventListener("touchmove", preventScroll, { capture: true, passive: false });
  window.addEventListener("keydown", preventScrollKeys, true);
}

function unblockScroll() {
  window.removeEventListener("wheel", preventScroll, true);
  window.removeEventListener("touchmove", preventScroll, true);
  window.removeEventListener("keydown", preventScrollKeys, true);
}

function finish(restorePreviousScroll: boolean) {
  if (!active) return;
  const current = active;
  window.clearTimeout(current.timeout);
  current.overlay.remove();
  active = null;
  unblockScroll();
  if (restorePreviousScroll) current.onAbort();
  publish("idle");
}

function waitForOpacity(overlay: HTMLElement, opacity: string, done: () => void, immediate: boolean) {
  if (immediate) {
    overlay.style.opacity = opacity;
    done();
    return;
  }

  let completed = false;
  const finish = () => {
    if (completed) return;
    completed = true;
    overlay.removeEventListener("transitionend", onEnd);
    window.clearTimeout(fallback);
    done();
  };
  const onEnd = (event: TransitionEvent) => {
    if (event.target === overlay && event.propertyName === "opacity") finish();
  };
  overlay.addEventListener("transitionend", onEnd);
  const fallback = window.setTimeout(finish, 350);
  requestAnimationFrame(() => { overlay.style.opacity = opacity; });
}

export const localeTransitionCoordinator = {
  getPhase: () => phase,
  subscribe(listener: (next: Phase) => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
  begin(source: string, target: string, onCovered: () => void, onAbort: () => void) {
    if (active) return false;
    const overlay = document.createElement("div");
    overlay.id = "locale-transition-screen";
    overlay.setAttribute("aria-hidden", "true");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "3000",
      background: "#0d0f10",
      opacity: "0",
      pointerEvents: "auto",
      transition: "opacity 180ms ease",
    });
    document.body.append(overlay);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeout = window.setTimeout(() => localeTransitionCoordinator.abort(), 8000);
    active = { source, target, overlay, reducedMotion, timeout, onAbort };
    blockScroll();
    publish("exiting");
    waitForOpacity(overlay, "1", () => {
      if (!active || active.overlay !== overlay) return;
      publish("waiting");
      onCovered();
    }, reducedMotion);
    return true;
  },
  enter(pathname: string, onBeforeReveal: () => void) {
    if (!active || active.target !== pathname || phase !== "waiting") return false;
    const current = active;
    onBeforeReveal();
    publish("entering");
    waitForOpacity(current.overlay, "0", () => {
      if (active === current) finish(false);
    }, current.reducedMotion);
    return true;
  },
  abort() {
    finish(true);
  },
  expectedPath: () => active?.target ?? null,
  sourcePath: () => active?.source ?? null,
};
