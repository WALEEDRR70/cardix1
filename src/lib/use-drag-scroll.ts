import { useEffect, useRef } from "react";

/** Enables click-and-drag horizontal scrolling (desktop mouse) on a scroll container. */
export function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let down = false;
    let moved = false;
    let startX = 0;
    let startScroll = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true;
      moved = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 4) {
        moved = true;
        el.style.cursor = "grabbing";
        el.style.userSelect = "none";
        el.setPointerCapture?.(e.pointerId);
      }
      if (moved) {
        el.scrollLeft = startScroll - dx;
        e.preventDefault();
      }
    };

    const end = () => {
      down = false;
      el.style.cursor = "";
      el.style.userSelect = "";
      // swallow the click that follows a drag
      if (moved) {
        const swallow = (ev: MouseEvent) => {
          ev.stopPropagation();
          ev.preventDefault();
        };
        el.addEventListener("click", swallow, { capture: true, once: true });
        setTimeout(() => el.removeEventListener("click", swallow, true), 0);
      }
      moved = false;
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, []);

  return ref;
}
