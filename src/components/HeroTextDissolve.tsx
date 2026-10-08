"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, type ComponentPropsWithoutRef, type HTMLAttributes } from "react";
import { useLenis } from "lenis/react";
import styles from "./HeroTextDissolve.module.css";

type TextTag = "h1" | "p";
type TextProps = ComponentPropsWithoutRef<"h1"> & ComponentPropsWithoutRef<"p">;

type WordProfile = {
  xPercent: number;
  yPercent: number;
  z: number;
  rotateX: number;
  start: number;
  end: number;
};

const TOKEN_PATTERN = /\S+|\s+/g;

function tokenize(text: string) {
  return text.match(TOKEN_PATTERN) ?? [];
}

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function randomRange(seed: string, min: number, max: number) {
  return min + (hash(seed) / 0xffffffff) * (max - min);
}

function createProfile(text: string, token: string, index: number): WordProfile {
  const seed = `${text}:${token}:${index}`;
  const start = randomRange(`${seed}:start`, 0.04, 0.22);

  return {
    xPercent: randomRange(`${seed}:x`, -88, 88),
    yPercent: randomRange(`${seed}:y`, -13, 13),
    z: randomRange(`${seed}:z`, 360, 600),
    rotateX: randomRange(`${seed}:rotate`, -72, 72),
    start,
    end: Math.min(0.94, start + randomRange(`${seed}:duration`, 0.56, 0.76)),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothStep(value: number) {
  return value * value * (3 - 2 * value);
}

function getProgress(hero: HTMLElement) {
  const distance = hero.offsetHeight - (hero.firstElementChild as HTMLElement).offsetHeight;
  if (distance <= 0) return 0;
  return clamp(-hero.getBoundingClientRect().top / distance, 0, 1);
}

function useHeroDissolve(text: string, whole = false) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const wordRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const reducedMotionRef = useRef(false);
  const lastFrameRef = useRef<{ progress: number; mobile: boolean; profiles: Array<WordProfile | null> } | null>(null);
  const tokens = useMemo(() => whole ? [text] : tokenize(text), [text, whole]);
  const profiles = useMemo(
    () => tokens.map((token, index) => token.trim() ? createProfile(text, token, index) : null),
    [text, tokens],
  );

  const applyProgress = useCallback((progress: number) => {
    const words = wordRefs.current;
    const mobile = window.innerWidth <= 620;
    const last = lastFrameRef.current;
    // Once the hero is outside its animation range, avoid rewriting every word
    // on every scroll event throughout the rest of the page.
    if (last?.progress === progress && last.mobile === mobile && last.profiles === profiles) return;
    lastFrameRef.current = { progress, mobile, profiles };

    for (let index = 0; index < words.length; index += 1) {
      const word = words[index];
      const profile = profiles[index];
      if (!word || !profile) continue;

      const localProgress = clamp((progress - profile.start) / (profile.end - profile.start), 0, 1);
      const easedProgress = smoothStep(localProgress);
      const opacity = 1 - easedProgress;
      word.style.opacity = `${opacity}`;
      const depth = profile.z * (mobile ? 0.7 : 1);
      word.style.transform = easedProgress === 0
        ? "none"
        : `${whole ? `perspective(${mobile ? 720 : 1000}px) ` : ""}translate(${profile.xPercent * easedProgress * (mobile ? 0.5 : 1)}%, ${profile.yPercent * easedProgress}%) translate3d(0, 0, ${depth * easedProgress}px) rotateX(${profile.rotateX * easedProgress}deg)`;
      if (whole && word.tagName === "A") {
        // Fully faded links must not leave an invisible pointer target.
        word.style.pointerEvents = opacity <= 0.01 ? "none" : "";
      }
    }
  }, [profiles, whole]);

  const applyCurrentProgress = useCallback(() => {
    const container = containerRef.current;
    const hero = container?.closest<HTMLElement>("[data-hero-dissolve]");
    if (!hero || reducedMotionRef.current) {
      applyProgress(0);
      return;
    }

    const entryState = document.documentElement.dataset.entryState;
    if (entryState === "required" || entryState === "opening") {
      applyProgress(0);
      return;
    }

    applyProgress(getProgress(hero));
  }, [applyProgress]);

  useLenis(() => {
    applyCurrentProgress();
  }, [applyCurrentProgress]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleReducedMotionChange = () => {
      reducedMotionRef.current = mediaQuery.matches;
      applyCurrentProgress();
    };

    const handleResize = () => applyCurrentProgress();
    handleReducedMotionChange();
    mediaQuery.addEventListener("change", handleReducedMotionChange);
    window.addEventListener("resize", handleResize);

    return () => {
      mediaQuery.removeEventListener("change", handleReducedMotionChange);
      window.removeEventListener("resize", handleResize);
    };
  }, [applyCurrentProgress]);

  const setItemRef = useCallback((element: HTMLElement | null) => {
    lastFrameRef.current = null;
    containerRef.current = element;
    wordRefs.current[0] = element;
  }, []);
  const setWordRef = useCallback((index: number, element: HTMLSpanElement | null) => {
    lastFrameRef.current = null;
    wordRefs.current[index] = element;
  }, []);
  return { containerRef, setItemRef, setWordRef, tokens };
}

export function HeroDissolveItem({
  as: Element = "span",
  motionId,
  className,
  ...props
}: { as?: "a" | "span" | "div"; motionId: string; href?: string } & HTMLAttributes<HTMLElement>) {
  const { setItemRef } = useHeroDissolve(motionId, true);
  return <Element
    {...props}
    className={`${className ?? ""} ${styles.item}`}
    data-dissolve-item={motionId}
    ref={setItemRef}
  />;
}

export function HeroTextDissolve({
  as,
  text,
  className,
  ...props
}: { as: TextTag; text: string } & TextProps) {
  const { containerRef, setWordRef, tokens } = useHeroDissolve(text);
  const Element = as;

  return (
    <Element {...props} className={className} data-dissolve-text="true">
      <span ref={containerRef} className={styles.container}>
        {tokens.map((token, index) => token.trim() ? (
          <span
            ref={(element) => setWordRef(index, element)}
            className={styles.word}
            data-dissolve-word={index}
            key={`${token}-${index}`}
          >
            {token}
          </span>
        ) : <Fragment key={`${token}-${index}`}>{token}</Fragment>)}
      </span>
    </Element>
  );
}
