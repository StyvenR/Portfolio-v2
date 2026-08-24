"use client";

import { type RefObject, useEffect, useRef } from "react";

export interface ScrollSnapOptions {
  enabled: boolean;
  /** Ecart en px tolere avant de recadrer une section apres un scroll libre. */
  threshold?: number;
  /** Duree max de l'animation de snap, en ms. */
  duration?: number;
}

/** Marge morte : en dessous, une frontiere est consideree deja atteinte. */
const BOUNDARY_EPSILON = 8;

/** Deux `wheel` espaces de plus de ce delai ouvrent un nouveau geste. */
const BURST_GAP_MS = 120;

/** Silence apres lequel un geste trackpad (inertie comprise) est termine. */
const TRACKPAD_SETTLE_MS = 140;

type Device = "mouse" | "trackpad";

/**
 * Distingue un cran de molette d'un geste trackpad.
 *
 * - Firefox rapporte la molette en lignes (`deltaMode` 1), le trackpad en px.
 * - Chromium/WebKit exposent `wheelDeltaY` : multiple exact de 120 pour un
 *   cran de molette, `-deltaY * 3` (donc quelconque) pour un trackpad.
 */
function detectDevice(event: WheelEvent): Device {
  if (event.deltaMode !== 0) return "mouse";

  const legacy = (event as WheelEvent & { wheelDeltaY?: number }).wheelDeltaY;
  if (typeof legacy === "number") {
    const abs = Math.abs(legacy);
    return abs >= 120 && abs % 120 === 0 ? "mouse" : "trackpad";
  }

  return Math.abs(event.deltaY) >= 50 ? "mouse" : "trackpad";
}

/**
 * Gere le scroll snap manuel sur les sections enfants d'un container.
 *
 * Molette et trackpad ne produisent pas le meme signal : la molette envoie un
 * evenement isole par cran, le trackpad un flux continu suivi d'inertie. Les
 * traiter pareil rendait la molette inutilisable (un cran avancait de ~100px,
 * le recadrage le ramenait aussitot en arriere). Chaque peripherique a donc
 * son propre mode :
 * - molette : un cran = un projet, deplacement pilote par le hook ;
 * - trackpad : scroll natif libre, recadrage a l'arret du geste.
 */
export function useScrollSnap(
  containerRef: RefObject<HTMLElement | null>,
  options: ScrollSnapOptions,
): void {
  const { enabled, threshold = 50, duration: maxDuration = 600 } = options;

  const animationRef = useRef<number | null>(null);
  const targetIndexRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!enabled || !container) return;

    // Les projets arrivent d'un fetch : la liste est relue a chaque geste
    // plutot que capturee au montage, sinon elle est perimee des l'arrivee
    // des donnees.
    const getSections = () =>
      Array.from(container.querySelectorAll("section")) as HTMLElement[];

    const documentTop = (section: HTMLElement) =>
      section.getBoundingClientRect().top + window.scrollY;

    const isInProjectsZone = () => {
      const rect = container.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    };

    /** Direction du dernier geste : -1 vers le haut, 1 vers le bas. */
    let direction: 1 | -1 = 1;

    // --- Animation maison -------------------------------------------------
    // `scrollTo({ behavior: "smooth" })` ne dit pas quand il a fini ni ou il
    // va : impossible d'enchainer un second cran en vol. On pilote donc le
    // deplacement nous-memes.

    const stopAnimation = () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      targetIndexRef.current = null;
    };

    const animateTo = (top: number, index: number) => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      targetIndexRef.current = index;

      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const from = window.scrollY;
      const to = Math.max(0, Math.min(top, maxScroll));
      const distance = to - from;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduced || Math.abs(distance) < 1) {
        window.scrollTo(0, to);
        stopAnimation();
        return;
      }

      // Proportionnelle a la distance pour qu'un petit recadrage ne traine
      // pas autant qu'un saut de section entiere.
      const span = Math.min(maxDuration, Math.max(260, Math.abs(distance) * 0.6));
      const start = performance.now();

      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / span);
        const eased = 1 - (1 - progress) ** 3;
        window.scrollTo(0, from + distance * eased);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(step);
          return;
        }
        stopAnimation();
      };

      animationRef.current = requestAnimationFrame(step);
    };

    // --- Reperage des sections -------------------------------------------

    /** Section dont le haut est le plus proche du haut du viewport. */
    const anchoredSection = (sections: HTMLElement[]) => {
      let index = -1;
      let distance = Infinity;

      sections.forEach((section, i) => {
        const gap = Math.abs(section.getBoundingClientRect().top);
        if (gap < distance) {
          distance = gap;
          index = i;
        }
      });

      return { index, distance };
    };

    /**
     * Prochaine frontiere de section dans le sens du geste, ou `null` quand
     * il n'y en a plus : le scroll natif reprend alors la main et laisse
     * sortir de la zone projets.
     */
    const boundaryIndex = (
      sections: HTMLElement[],
      way: 1 | -1,
    ): number | null => {
      if (way === 1) {
        const index = sections.findIndex(
          (section) => section.getBoundingClientRect().top > BOUNDARY_EPSILON,
        );
        return index === -1 ? null : index;
      }

      for (let index = sections.length - 1; index >= 0; index -= 1) {
        const { top } = sections[index].getBoundingClientRect();
        if (top < -BOUNDARY_EPSILON) return index;
      }
      return null;
    };

    /** Recadrer ici bloquerait la sortie de la zone : on laisse filer. */
    const shouldSkipSnap = (sections: HTMLElement[], index: number) => {
      const rect = sections[index].getBoundingClientRect();
      if (index === sections.length - 1 && rect.top < -150) return true;
      // Au-dessus du premier projet en remontant, snapper rejouerait vers le
      // bas et retiendrait l'utilisateur dans la zone.
      return index === 0 && rect.top > 0 && direction === -1;
    };

    // --- Mode molette : un cran = un projet -------------------------------

    const stepOneSection = (way: 1 | -1): boolean => {
      const sections = getSections();
      if (sections.length === 0) return false;

      // Un cran pendant l'animation enchaine sur la section suivante au lieu
      // d'etre avale : faire tourner la molette vite defile plusieurs projets.
      const index =
        targetIndexRef.current !== null
          ? targetIndexRef.current + way
          : boundaryIndex(sections, way);

      if (index === null || index < 0 || index >= sections.length) return false;

      animateTo(documentTop(sections[index]), index);
      return true;
    };

    // --- Mode trackpad : recadrage a l'arret ------------------------------

    let settleTimer: ReturnType<typeof setTimeout> | null = null;

    const settle = () => {
      if (animationRef.current !== null) return;
      if (!isInProjectsZone()) return;

      const sections = getSections();
      const { index, distance } = anchoredSection(sections);
      if (index === -1 || distance <= threshold) return;
      if (shouldSkipSnap(sections, index)) return;

      animateTo(documentTop(sections[index]), index);
    };

    const scheduleSettle = () => {
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, TRACKPAD_SETTLE_MS);
    };

    // --- Garde : un scroller interne garde la main ------------------------

    const scrollsInside = (target: EventTarget | null, delta: number) => {
      let node: Node | null = target instanceof Node ? target : null;

      while (node && node !== container) {
        if (node instanceof HTMLElement) {
          const { overflowY } = getComputedStyle(node);
          const scrollable =
            /(auto|scroll|overlay)/.test(overflowY) &&
            node.scrollHeight > node.clientHeight + 1;

          if (scrollable) {
            const atTop = node.scrollTop <= 0;
            const atBottom =
              node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
            if (!(delta < 0 && atTop) && !(delta > 0 && atBottom)) return true;
          }
        }
        node = node.parentNode;
      }
      return false;
    };

    // --- Handlers ---------------------------------------------------------

    let device: Device = "trackpad";
    let lastWheelAt = 0;

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return; // zoom au pincement
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      if (!isInProjectsZone()) return;
      // Scroll verrouille (modale projet ouverte) : rien a snapper.
      if (getComputedStyle(document.body).overflowY === "hidden") return;
      if (scrollsInside(event.target, event.deltaY)) return;

      direction = event.deltaY < 0 ? -1 : 1;

      const now = performance.now();
      // La classification est figee pour toute la duree du geste : un trackpad
      // accelere finit par produire des deltas qui ressemblent a des crans.
      if (now - lastWheelAt > BURST_GAP_MS) device = detectDevice(event);
      lastWheelAt = now;

      if (device === "mouse") {
        // Sans preventDefault, le scroll natif du cran s'ajoute a l'animation
        // et la fait deraper.
        if (stepOneSection(direction)) event.preventDefault();
        return;
      }

      stopAnimation();
      scheduleSettle();
    };

    // Rattrape les scrolls qui ne passent pas par la molette : barre de
    // defilement, clavier, ancres.
    const handleScrollEnd = () => {
      if (performance.now() - lastWheelAt < TRACKPAD_SETTLE_MS) return;
      settle();
    };

    const hasScrollEnd = "onscrollend" in window;
    let scrollEndFallback: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      if (scrollEndFallback) clearTimeout(scrollEndFallback);
      scrollEndFallback = setTimeout(handleScrollEnd, 150);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    if (hasScrollEnd) {
      window.addEventListener("scrollend", handleScrollEnd);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (hasScrollEnd) {
        window.removeEventListener("scrollend", handleScrollEnd);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
      if (settleTimer) clearTimeout(settleTimer);
      if (scrollEndFallback) clearTimeout(scrollEndFallback);
      stopAnimation();
    };
  }, [containerRef, enabled, threshold, maxDuration]);
}
