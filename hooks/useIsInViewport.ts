"use client";

import { type RefObject, useEffect, useState } from "react";

/**
 * Detecte si un element est visible dans le viewport via IntersectionObserver.
 */
export function useIsInViewport(ref: RefObject<HTMLElement | null>): boolean {
  const [isInViewport, setIsInViewport] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return isInViewport;
}
