"use client";

import { useEffect, useRef } from "react";

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
    const move = (event: MouseEvent) => { x = event.clientX; y = event.clientY; };
    const draw = () => {
      ringX += (x - ringX) * 0.16;
      ringY += (y - ringY) * 0.16;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px,${y}px,0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${ringX}px,${ringY}px,0)`;
      frame = requestAnimationFrame(draw);
    };
    window.addEventListener("mousemove", move);
    draw();
    return () => {
      document.documentElement.classList.remove("has-fine-cursor");
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <><div ref={dot} className="cursor-dot" /><div ref={ring} className="cursor-ring" /></>;
}
