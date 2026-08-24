"use client";

import { blocOf } from "@/utils/competences";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * Demande d'ouverture d'une modale projet. Le `nonce` garantit un nouvel objet
 * à chaque clic : redemander le même projet relance bien l'ouverture, même
 * après que l'utilisateur a refermé la modale.
 */
export interface FocusRequest {
  target: string;
  nonce: number;
}

interface PortfolioFocusValue {
  /** Compétence dépliée dans le référentiel (null = tout replié). */
  openCompetence: string | null;
  /** Projet dont la modale doit s'ouvrir dans la section Projets. */
  projectRequest: FocusRequest | null;
  /**
   * Un défilement inter-sections est en cours. La section Projets s'en sert
   * pour désarmer son scroll snap, qui sinon rattraperait le défilement au
   * passage et le ramènerait sur le projet le plus proche.
   */
  isFocusScrolling: boolean;
  /** Déplie une compétence, ou la replie si elle l'était déjà. */
  toggleCompetence: (code: string) => void;
  /** Déplie une compétence et amène son secteur à l'écran. */
  focusCompetence: (code: string) => void;
  /** Ouvre la modale d'un projet et amène sa section à l'écran. */
  focusProject: (projectId: string) => void;
}

const PortfolioFocusContext = createContext<PortfolioFocusValue | null>(null);

/** Identifiants d'ancre : une seule convention, partagée par les deux sections. */
export const competenceAnchorId = (code: string) => `competence-${code}`;
export const blocAnchorId = (code: string) => `secteur-${code}`;
export const projectAnchorId = (projectId: string) => `project-${projectId}`;

/** Durée du recentrage animé, en ms. */
const FOCUS_SCROLL_MS = 600;

/** Délai après lequel la mise en page est stabilisée (repli d'un panneau : 250ms). */
const LAYOUT_SETTLE_MS = 300;

/** Arrête le recentrage en cours : frame annulée et écouteurs d'abandon retirés. */
let stopFocusScroll = () => {};

/** Saut instantané, `scroll-margin-top` compris. */
function jumpToElement(element: HTMLElement) {
  element.scrollIntoView({ behavior: "auto", block: "start" });
}

/**
 * Recentrage animé dont la cible est relue à chaque frame.
 *
 * Ouvrir une compétence replie celle qui l'était déjà, et ce repli anime sa
 * hauteur sur 250ms. Quand le panneau qui se referme est au-dessus de l'ancre,
 * il lui retire sa hauteur *pendant* le trajet : un `scrollIntoView` classique,
 * qui fige sa cible au premier frame, dépassait d'autant et laissait la carte
 * sous le header fixe. Re-viser en continu absorbe ce décalage, ainsi que
 * l'animation d'entrée des cartes et les images qui se chargent en route.
 */
function animateToElement(element: HTMLElement) {
  // Un recentrage encore en vol est arrêté d'abord, écouteurs compris : sinon
  // son abandon resterait branché et couperait celui-ci au premier geste.
  stopFocusScroll();

  const offset = Number.parseFloat(getComputedStyle(element).scrollMarginTop);
  const margin = Number.isNaN(offset) ? 0 : offset;
  const from = window.scrollY;
  const start = performance.now();

  let frame: number | null = null;

  const stop = () => {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchstart", stop);
    stopFocusScroll = () => {};
  };

  stopFocusScroll = stop;

  // L'utilisateur qui reprend la main gagne toujours contre l'animation.
  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("touchstart", stop, { passive: true });

  const step = (now: number) => {
    const progress = Math.min(1, (now - start) / FOCUS_SCROLL_MS);
    const eased = 1 - (1 - progress) ** 3;

    const max = document.documentElement.scrollHeight - window.innerHeight;
    const aim = window.scrollY + element.getBoundingClientRect().top - margin;
    const target = Math.max(0, Math.min(aim, max));

    window.scrollTo(0, from + (target - from) * eased);

    if (progress < 1) {
      frame = requestAnimationFrame(step);
      return;
    }
    stop();
  };

  frame = requestAnimationFrame(step);
}

/**
 * Amène une ancre en haut du viewport. Les cibles portent une `scroll-mt-*`
 * pour compenser le header fixe. Le `requestAnimationFrame` laisse React
 * commiter d'abord — notamment la fermeture de modale, qui restaure le scroll
 * du body. `behavior: "auto"` quand le déplacement est masqué par une modale :
 * inutile d'animer ce que personne ne voit.
 */
export function scrollToAnchor(
  id: string,
  behavior: ScrollBehavior = "smooth",
) {
  requestAnimationFrame(() => {
    const element = document.getElementById(id);
    if (!element) return;

    if (behavior === "auto") {
      jumpToElement(element);
      return;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced) {
      // Même dérive qu'en animé, en une seule fois : on recale une fois le
      // panneau précédent replié.
      jumpToElement(element);
      setTimeout(() => jumpToElement(element), LAYOUT_SETTLE_MS);
      return;
    }

    animateToElement(element);
  });
}

export function PortfolioFocusProvider({ children }: { children: ReactNode }) {
  const [openCompetence, setOpenCompetence] = useState<string | null>(null);
  const [projectRequest, setProjectRequest] = useState<FocusRequest | null>(
    null,
  );
  const [isFocusScrolling, setIsFocusScrolling] = useState(false);
  const nonceRef = useRef(0);

  // `scrollend` couvre Chrome/Firefox ; le timer rattrape Safari. La marge est
  // large : un saut d'une section à l'autre traverse plusieurs milliers de px.
  useEffect(() => {
    if (!isFocusScrolling) return;

    const done = () => setIsFocusScrolling(false);
    window.addEventListener("scrollend", done, { once: true });
    const timer = setTimeout(done, 2000);

    return () => {
      window.removeEventListener("scrollend", done);
      clearTimeout(timer);
    };
  }, [isFocusScrolling]);

  const toggleCompetence = useCallback((code: string) => {
    setOpenCompetence((current) => (current === code ? null : code));
  }, []);

  /**
   * On vise le secteur entier, pas la ligne : cadrer la seule compétence fait
   * sortir l'en-tête du bloc et sa couverture du viewport, donc perdre le
   * contexte de ce qu'on regarde. Le repli sur la ligne ne sert qu'aux codes
   * hors référentiel.
   */
  const focusCompetence = useCallback((code: string) => {
    setOpenCompetence(code);
    setIsFocusScrolling(true);

    const bloc = blocOf(code);
    scrollToAnchor(bloc ? blocAnchorId(bloc.code) : competenceAnchorId(code));
  }, []);

  const focusProject = useCallback((projectId: string) => {
    setProjectRequest({ target: projectId, nonce: ++nonceRef.current });
  }, []);

  const value = useMemo(
    () => ({
      openCompetence,
      projectRequest,
      isFocusScrolling,
      toggleCompetence,
      focusCompetence,
      focusProject,
    }),
    [
      openCompetence,
      projectRequest,
      isFocusScrolling,
      toggleCompetence,
      focusCompetence,
      focusProject,
    ],
  );

  return (
    <PortfolioFocusContext.Provider value={value}>
      {children}
    </PortfolioFocusContext.Provider>
  );
}

export function usePortfolioFocus() {
  const context = useContext(PortfolioFocusContext);
  if (!context) {
    throw new Error(
      "usePortfolioFocus doit être utilisé dans un PortfolioFocusProvider",
    );
  }
  return context;
}
