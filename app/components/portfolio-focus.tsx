"use client";

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
  /** Déplie une compétence et amène sa ligne à l'écran. */
  focusCompetence: (code: string) => void;
  /** Ouvre la modale d'un projet et amène sa section à l'écran. */
  focusProject: (projectId: string) => void;
}

const PortfolioFocusContext = createContext<PortfolioFocusValue | null>(null);

/** Identifiants d'ancre : une seule convention, partagée par les deux sections. */
export const competenceAnchorId = (code: string) => `competence-${code}`;
export const projectAnchorId = (projectId: string) => `project-${projectId}`;

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

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    element.scrollIntoView({
      behavior: reduced ? "auto" : behavior,
      block: "start",
    });
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

  const focusCompetence = useCallback((code: string) => {
    setOpenCompetence(code);
    setIsFocusScrolling(true);
    scrollToAnchor(competenceAnchorId(code));
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
