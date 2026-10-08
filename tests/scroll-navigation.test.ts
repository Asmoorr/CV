import { afterEach, describe, expect, it, vi } from "vitest";
import type Lenis from "lenis";
import { scrollToTarget } from "../src/lib/scroll-navigation";

afterEach(() => vi.unstubAllGlobals());

function setup(touch: boolean, reduced = false) {
  const scrollTo = vi.fn();
  vi.stubGlobal("window", {
    matchMedia: (query: string) => ({ matches: query.includes("reduced-motion") ? reduced : touch }),
    scrollY: 200,
    scrollTo,
  });
  const lenis = { isStopped: false, isScrolling: false, scrollTo: vi.fn(), stop: vi.fn(), start: vi.fn() };
  return { nativeScroll: scrollTo, lenis, instance: lenis as unknown as Lenis };
}

describe("navigation scroll ownership", () => {
  it("uses native scrolling as a fallback before Lenis is available", () => {
    const { nativeScroll, lenis } = setup(true);
    const root = {};
    vi.stubGlobal("document", { documentElement: root });
    vi.stubGlobal("getComputedStyle", (element: unknown) => element === root
      ? { scrollPaddingTop: "8px" } : { scrollMarginTop: "56px" });
    const target = { getBoundingClientRect: () => ({ top: 500 }) } as HTMLElement;
    scrollToTarget(undefined, target);
    expect(nativeScroll).toHaveBeenCalledExactlyOnceWith({ top: 636, behavior: "smooth" });
    expect(lenis.scrollTo).not.toHaveBeenCalled();
  });

  it.each([false, true])("uses identical timed navigation with touch=%s", (touch) => {
    const { nativeScroll, lenis, instance } = setup(touch);
    scrollToTarget(instance, 900);
    expect(lenis.scrollTo).toHaveBeenCalledWith(900, expect.objectContaining({ duration: 1.8, lerp: 0, immediate: false }));
    const easing = lenis.scrollTo.mock.calls[0][1].easing;
    expect([0, .25, .5, .75, 1].map(easing)).toEqual([0, .15625, .5, .84375, 1]);
    expect(nativeScroll).not.toHaveBeenCalled();
  });

  it("honors reduced motion on mobile", () => {
    const { nativeScroll, lenis, instance } = setup(true, true);
    scrollToTarget(instance, 0);
    expect(lenis.scrollTo).toHaveBeenCalledWith(0, expect.objectContaining({ immediate: true }));
    expect(nativeScroll).not.toHaveBeenCalled();
  });

  it("does not bypass the entry scroll lock", () => {
    const { nativeScroll, lenis, instance } = setup(true);
    lenis.isStopped = true;
    scrollToTarget(instance, 900);
    expect(nativeScroll).not.toHaveBeenCalled();
    expect(lenis.scrollTo).not.toHaveBeenCalled();
  });
});
