"use client";

import { type RefObject, useEffect, useRef } from "react";

export interface ScrollSnapOptions {
  enabled: boolean;
  /** Écart en px toléré avant de recadrer une section après un scroll libre. */
  threshold?: number;
  /** Durée max de l'animation de snap, en ms. */
  duration?: number;
}

/** Marge morte : en dessous, une frontière est considérée déjà atteinte. */
const BOUNDARY_EPSILON = 8;

/** Deux `wheel` espacés de plus de ce délai ouvrent un nouveau geste. */
const BURST_GAP_MS = 120;

/** Silence après lequel un geste (inertie comprise) est terminé. */
const SETTLE_MS = 140;

/**
 * Déplacement minimal, en px, pour qu'un geste resté dans sa section compte
 * comme une intention d'avancer.
 *
 * C'est le seul réglage qui arbitre entre les périphériques, et il est en
 * pixels justement pour ne pas dépendre d'eux : un cran de molette vaut de 40
 * à 120px selon l'OS et ses réglages d'accélération, le seuil passe donc sous
 * le plus petit d'entre eux tout en restant au-dessus des micro-mouvements
 * d'un trackpad.
 */
const ADVANCE_INTENT_PX = 40;

/**
 * Gère le scroll snap manuel sur les sections enfants d'un container.
 *
 * Le scroll natif reste libre pendant le geste ; le recadrage n'intervient
 * qu'à l'arrêt, inertie comprise. Aucune distinction molette / trackpad n'est
 * faite : la décision se prend sur la distance parcourue, la seule grandeur
 * qui veuille dire la même chose d'un périphérique et d'un OS à l'autre.
 */
export function useScrollSnap(
  containerRef: RefObject<HTMLElement | null>,
  options: ScrollSnapOptions,
): void {
  const { enabled, threshold = 50, duration: maxDuration = 600 } = options;

  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!enabled || !container) return;

    // Les projets arrivent d'un fetch : la liste est relue à chaque geste
    // plutôt que capturée au montage, sinon elle est périmée dès l'arrivée
    // des données.
    const getSections = () =>
      Array.from(container.querySelectorAll("section")) as HTMLElement[];

    const documentTop = (section: HTMLElement) =>
      section.getBoundingClientRect().top + window.scrollY;

    const isInProjectsZone = () => {
      const rect = container.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    };

    // --- Animation maison -------------------------------------------------
    // `scrollTo({ behavior: "smooth" })` ne dit pas quand il a fini : impossible
    // de savoir si un geste arrive pendant ou après. On pilote nous-mêmes.

    const stopAnimation = () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };

    const animateTo = (top: number) => {
      stopAnimation();

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
        return;
      }

      // Proportionnelle à la distance : un recadrage de 80px ne doit pas durer
      // aussi longtemps qu'un saut de section entière.
      const span = Math.min(
        maxDuration,
        Math.max(240, Math.abs(distance) * 0.5),
      );
      const start = performance.now();

      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / span);
        const eased = 1 - (1 - progress) ** 3;
        window.scrollTo(0, from + distance * eased);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(step);
          return;
        }
        animationRef.current = null;
      };

      animationRef.current = requestAnimationFrame(step);
    };

    // --- Repérage des sections -------------------------------------------

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
     * Prochaine frontière de section dans le sens du geste, ou `null` quand il
     * n'y en a plus : le scroll natif garde alors la main et laisse sortir de
     * la zone projets.
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
        if (sections[index].getBoundingClientRect().top < -BOUNDARY_EPSILON) {
          return index;
        }
      }
      return null;
    };

    /** Recadrer ici retiendrait l'utilisateur dans la zone : on laisse filer. */
    const shouldSkipSnap = (
      sections: HTMLElement[],
      index: number,
      way: 1 | -1,
    ) => {
      const rect = sections[index].getBoundingClientRect();
      if (index === sections.length - 1 && rect.top < -150) return true;
      return index === 0 && rect.top > 0 && way === -1;
    };

    // --- Geste en cours ---------------------------------------------------

    let lastWheelAt = 0;
    let lastDirection: 1 | -1 = 1;
    let gestureStartY = 0;
    let gestureStartIndex = -1;
    let settleTimer: ReturnType<typeof setTimeout> | null = null;

    const settle = (fromGesture: boolean) => {
      if (animationRef.current !== null) return;
      if (!isInProjectsZone()) return;

      const sections = getSections();
      if (sections.length === 0) return;

      const nearest = anchoredSection(sections);
      if (nearest.index === -1) return;

      const travel = window.scrollY - gestureStartY;
      const way: 1 | -1 =
        travel === 0 ? lastDirection : travel > 0 ? 1 : -1;

      // Le geste n'a pas quitté sa section de départ. Au-delà du seuil
      // d'intention on avance plutôt que de revenir en arrière : sans ça un
      // cran de molette (~100px) se faisait ramener à son point de départ,
      // là où un flick de trackpad (~800px) changeait bien de section. C'est
      // cet écart qui rendait le ressenti dépendant du périphérique.
      const stalled = fromGesture && nearest.index === gestureStartIndex;

      let index = nearest.index;

      if (stalled && Math.abs(travel) >= ADVANCE_INTENT_PX) {
        const next = boundaryIndex(sections, way);
        if (next === null) return;
        index = next;
      } else if (nearest.distance <= threshold) {
        return;
      }

      if (shouldSkipSnap(sections, index, way)) return;

      animateTo(documentTop(sections[index]));
    };

    const scheduleSettle = (fromGesture: boolean) => {
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(() => settle(fromGesture), SETTLE_MS);
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

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return; // zoom au pincement
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      if (!isInProjectsZone()) return;
      // Scroll verrouillé (modale projet ouverte) : rien à recadrer.
      if (getComputedStyle(document.body).overflowY === "hidden") return;
      if (scrollsInside(event.target, event.deltaY)) return;

      lastDirection = event.deltaY < 0 ? -1 : 1;

      const now = performance.now();
      if (now - lastWheelAt > BURST_GAP_MS) {
        // `wheel` précède l'application du scroll : on lit bien la position
        // d'avant le geste.
        gestureStartY = window.scrollY;
        gestureStartIndex = anchoredSection(getSections()).index;
      }
      lastWheelAt = now;

      stopAnimation();
      scheduleSettle(true);
    };

    // Rattrape les scrolls qui ne passent pas par la molette : barre de
    // défilement, clavier, ancres. Pas de geste, donc pas de seuil d'intention.
    const handleScrollEnd = () => {
      if (performance.now() - lastWheelAt < SETTLE_MS) return;
      settle(false);
    };

    const hasScrollEnd = "onscrollend" in window;
    let scrollEndFallback: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      if (scrollEndFallback) clearTimeout(scrollEndFallback);
      scrollEndFallback = setTimeout(handleScrollEnd, 150);
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
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
