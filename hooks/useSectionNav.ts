"use client";

import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const SECTION_SELECTOR = "[data-project-section]";

/**
 * Suit la section projet qui occupe le centre du viewport et expose une
 * navigation prev/next vers les sections voisines.
 *
 * `items` sert de dependance : les sections sont remontees des que la liste
 * change d'identite, il faut donc re-interroger le DOM et rebrancher
 * l'observer sur les nouveaux noeuds.
 */
export function useSectionNav(
  containerRef: RefObject<HTMLElement | null>,
  items: readonly unknown[],
) {
  const sectionsRef = useRef<HTMLElement[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!isNavigating) return;

    const done = () => setIsNavigating(false);

    // `scrollend` couvre Chrome/Firefox ; le timer rattrape Safari.
    window.addEventListener("scrollend", done, { once: true });
    const timer = setTimeout(done, 1000);

    return () => {
      window.removeEventListener("scrollend", done);
      clearTimeout(timer);
    };
  }, [isNavigating]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sections = Array.from(
      container.querySelectorAll<HTMLElement>(SECTION_SELECTOR),
    );
    sectionsRef.current = sections;
    if (sections.length === 0) return;

    // Le rootMargin reduit le viewport a sa ligne mediane : une section n'est
    // "intersecting" que lorsqu'elle occupe le centre de l'ecran. Le callback
    // ne se declenche donc qu'aux transitions, pas a chaque frame de scroll.
    const intersecting = new Set<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target);
          else intersecting.delete(entry.target);
        }

        const index = sections.findIndex((section) =>
          intersecting.has(section),
        );
        setActiveIndex(index === -1 ? null : index);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [containerRef, items]);

  const scrollToIndex = useCallback((index: number) => {
    const target = sectionsRef.current[index];
    if (!target) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    setIsNavigating(true);
    target.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  const goPrev = useCallback(() => {
    if (activeIndex !== null) scrollToIndex(activeIndex - 1);
  }, [activeIndex, scrollToIndex]);

  const goNext = useCallback(() => {
    if (activeIndex !== null) scrollToIndex(activeIndex + 1);
  }, [activeIndex, scrollToIndex]);

  return {
    activeIndex,
    goPrev,
    goNext,
    isNavigating,
    // Aucune section au centre : on est sur le titre ou deja passe le dernier
    // projet, les fleches n'ont rien a piloter.
    visible: activeIndex !== null,
    canGoPrev: activeIndex !== null && activeIndex > 0,
    canGoNext: activeIndex !== null && activeIndex < items.length - 1,
  };
}
