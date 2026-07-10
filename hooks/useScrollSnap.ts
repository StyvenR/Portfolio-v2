"use client";

import { type RefObject, useEffect, useRef } from "react";

export interface ScrollSnapOptions {
  enabled: boolean;
  threshold?: number;
  cooldown?: number;
}

/**
 * Gere le scroll snap manuel sur les sections enfants d'un container.
 * - Intercepte le wheel pour snapper a la section la plus proche
 */
export function useScrollSnap(
  containerRef: RefObject<HTMLElement | null>,
  options: ScrollSnapOptions,
): void {
  const { enabled, threshold = 50, cooldown = 600 } = options;

  const isScrollingRef = useRef(false);
  const lastScrollTimeRef = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollEndTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sections = Array.from(
      container.querySelectorAll("section"),
    ) as HTMLElement[];

    if (sections.length === 0) return;

    const isInProjectsZone = (): boolean => {
      if (!container) return false;
      const containerRect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      return containerRect.top < viewportHeight && containerRect.bottom > 0;
    };

    // --- Trouver la section la plus proche ---
    const findClosestSection = (): {
      section: HTMLElement;
      distance: number;
    } | null => {
      let closest: HTMLElement | null = null;
      let closestDist = Infinity;

      for (const section of sections) {
        const dist = Math.abs(section.getBoundingClientRect().top);
        if (dist < closestDist) {
          closestDist = dist;
          closest = section;
        }
      }

      return closest ? { section: closest, distance: closestDist } : null;
    };

    // --- Suivre la direction du scroll pour laisser sortir de la zone ---
    let lastScrollY = window.scrollY;
    let scrollDirection: "up" | "down" = "down";

    const trackDirection = () => {
      const y = window.scrollY;
      if (y !== lastScrollY) {
        scrollDirection = y < lastScrollY ? "up" : "down";
        lastScrollY = y;
      }
    };

    // --- Verifier si on doit ignorer le snap (sortie de zone par le haut ou le bas) ---
    const shouldSkipSnap = (section: HTMLElement): boolean => {
      const rect = section.getBoundingClientRect();
      const isLastSection = section === sections[sections.length - 1];
      if (isLastSection && rect.top < -150) return true;
      // En remontant au-dessus de la premiere section, snapper la rejouerait
      // vers le bas : on laisse l'utilisateur quitter la zone.
      const isFirstSection = section === sections[0];
      return isFirstSection && rect.top > 0 && scrollDirection === "up";
    };

    // --- Snapper vers une section ---
    const snapToSection = (section: HTMLElement): void => {
      isScrollingRef.current = true;
      const targetTop = section.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({ top: targetTop, behavior: "smooth" });

      lastScrollTimeRef.current = Date.now();

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, cooldown);
    };

    // --- Wheel handler ---
    let wheelTimeout: NodeJS.Timeout | null = null;
    let isWheeling = false;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        scrollDirection = e.deltaY < 0 ? "up" : "down";
      }
      if (!isInProjectsZone()) return;

      if (isScrollingRef.current) {
        e.preventDefault();
        return;
      }

      const now = Date.now();

      if (wheelTimeout) clearTimeout(wheelTimeout);

      isWheeling = true;
      wheelTimeout = setTimeout(() => {
        isWheeling = false;
      }, 150);

      setTimeout(() => {
        if (isWheeling || isScrollingRef.current) return;
        if (!isInProjectsZone()) return;

        const result = findClosestSection();
        if (!result) return;
        if (shouldSkipSnap(result.section)) return;

        if (result.distance > 100 && now - lastScrollTimeRef.current > 100) {
          snapToSection(result.section);
        }
      }, 200);
    };

    // --- ScrollEnd handler ---
    const handleScrollEnd = () => {
      if (!isInProjectsZone()) return;
      if (isScrollingRef.current) return;

      const result = findClosestSection();
      if (!result) return;
      if (shouldSkipSnap(result.section)) return;

      if (result.distance > threshold) {
        snapToSection(result.section);
      }
    };

    // --- Event listeners ---
    if (!enabled) return;

    window.addEventListener("wheel", handleWheel, { passive: false });

    const handleScroll = () => {
      trackDirection();
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
      }
      scrollEndTimerRef.current = setTimeout(handleScrollEnd, 150);
    };

    const hasScrollEnd =
      typeof window !== "undefined" && "onscrollend" in window;

    if (hasScrollEnd) {
      window.addEventListener("scrollend", handleScrollEnd);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (hasScrollEnd) {
        window.removeEventListener("scrollend", handleScrollEnd);
      }
      window.removeEventListener("scroll", handleScroll);
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
      if (wheelTimeout) clearTimeout(wheelTimeout);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [containerRef, enabled, threshold, cooldown]);
}
