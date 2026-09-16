"use client";

import { useEffect, useRef } from "react";
import styles from "./FinePointerCursor.module.css";

export function FinePointerCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!media.matches) return;
    document.documentElement.classList.add("has-fine-cursor");
    let x = -80;
    let y = -80;
    let ringX = x;
    let ringY = y;
    let frame = 0;
    let interactive = false;
    const isInteractiveTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;
      const control = target.closest("a[href], button:not([disabled]), [role='button'], input:not([disabled]), select:not([disabled]), textarea:not([disabled])");
      if (!control || control.closest("header, nav")) return false;
      return !(control instanceof HTMLAnchorElement && control.getAttribute("href")?.startsWith("#"));
    };
    const move = (event: MouseEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px,${y}px,0)`;
      const nextInteractive = isInteractiveTarget(event.target);
      if (nextInteractive !== interactive) {
        interactive = nextInteractive;
        if (ring.current) ring.current.dataset.interactive = String(interactive);
      }
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const leave = () => {
      interactive = false;
      if (ring.current) ring.current.dataset.interactive = "false";
    };
    const draw = () => {
      frame = 0;
      ringX += (x - ringX) * 0.16;
      ringY += (y - ringY) * 0.16;
      if (ring.current) ring.current.style.transform = `translate3d(${ringX}px,${ringY}px,0)`;
      if (Math.abs(x - ringX) > 0.1 || Math.abs(y - ringY) > 0.1) {
        frame = requestAnimationFrame(draw);
      }
    };
    window.addEventListener("mousemove", move);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      document.documentElement.classList.remove("has-fine-cursor");
      window.removeEventListener("mousemove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <><div ref={dot} className={`${styles.dot} cursor-dot`} /><div ref={ring} className={`${styles.ring} cursor-ring`} data-interactive="false"><span /></div></>;
}
