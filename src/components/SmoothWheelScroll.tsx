"use client";

import { ReactLenis } from "lenis/react";

const options = {
  autoRaf: true,
  smoothWheel: true,
  syncTouch: false,
  wheelMultiplier: 1,
  respectReducedMotion: true,
  anchors: true,
  virtualScroll: ({ deltaX, deltaY, event }: { deltaX: number; deltaY: number; event: WheelEvent | TouchEvent }) => {
    const isPinchZoom = "ctrlKey" in event && event.ctrlKey;
    const isHorizontalGesture = Math.abs(deltaX) >= Math.abs(deltaY);
    const entryIsLocked = document.documentElement.dataset.entryState === "required"
      || document.documentElement.dataset.entryState === "opening";

    return !isPinchZoom && !isHorizontalGesture && !entryIsLocked;
  },
};

export function SmoothWheelScroll() {
  return <ReactLenis root options={options}>{null}</ReactLenis>;
}
