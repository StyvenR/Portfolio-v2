"use client";

import {
  ACTIVITES,
  BLOCS,
  TOTAL_COMPETENCES,
  type Bloc,
  type Competence,
} from "@/utils/competences";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  blocAnchorId,
  competenceAnchorId,
  usePortfolioFocus,
} from "./portfolio-focus";

interface ProjectLite {
  id: string;
  title: string;
  competences?: { code: string; evidence: string | null }[];
}

interface Preuve {
  projectId: string;
  title: string;
  evidence: string | null;
}

/** code compétence -> projets qui la couvrent, dans l'ordre d'affichage des projets. */
type PreuvesIndex = Map<string, Preuve[]>;

/**
 * Statut d'une compétence, transposé du chronométrage F1 :
 * violet = meilleur temps (plusieurs projets), vert = secteur validé,
 * jaune = drapeau jaune (aucune preuve encore rattachée).
 */
function statut(count: number) {
  if (count === 0) {
    return {
      dot: "bg-yellow-400 shadow-[0_0_6px_#facc15]",
      bar: "bg-yellow-400/70",
      text: "text-yellow-400",
      rowHover: "hover:border-yellow-400/40",
    };
  }
  if (count === 1) {
    return {
      dot: "bg-green-500 shadow-[0_0_6px_#22c55e]",
      bar: "bg-green-500",
      text: "text-green-500",
      rowHover: "hover:border-green-500/40",
    };
  }
  return {
    dot: "bg-purple-500 shadow-[0_0_6px_#a855f7]",
    bar: "bg-purple-500",
    text: "text-purple-400",
    rowHover: "hover:border-purple-500/40",
  };
}

function CoverageRing({ pct }: { pct: number }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative w-[64px] h-[64px] shrink-0">
      <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="#262626"
          strokeWidth="5"
        />
        <motion.circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="#dc2626"
          strokeWidth="5"
          strokeLinecap="butt"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: circumference * (1 - pct) }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-black text-red-500 leading-none">
          {Math.round(pct * 100)}%
        </span>
      </div>
    </div>
  );
}

function CompetenceRow({
  competence,
  preuves,
  isOpen,
  onToggle,
  onOpenProject,
}: {
  competence: Competence;
  preuves: Preuve[];
  isOpen: boolean;
  onToggle: () => void;
  onOpenProject: (projectId: string) => void;
}) {
  const s = statut(preuves.length);
  const activite = ACTIVITES[competence.activite];
  const panelId = `competence-panel-${competence.code}`;

  return (
    <div
      id={competenceAnchorId(competence.code)}
      className={`scroll-mt-20 border-b border-red-600/15 last:border-b-0 ${s.rowHover}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full flex items-center gap-3 md:gap-4 px-3 md:px-4 py-3 text-left transition-colors hover:bg-red-600/5 focus-visible:outline-none focus-visible:bg-red-600/10"
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />

        <span className="font-black text-red-600 text-[11px] md:text-xs tracking-widest w-11 shrink-0">
          {competence.code}
        </span>

        <span className="flex-1 min-w-0 text-xs md:text-sm text-neutral-200 leading-snug">
          {competence.label}
        </span>

        {/* Segments de chrono : 1 barre allumée par projet, 3 max */}
        <span className="hidden sm:flex gap-1 shrink-0" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`w-4 h-1.5 ${
                i < Math.min(preuves.length, 3) ? s.bar : "bg-neutral-800"
              }`}
            />
          ))}
        </span>

        <span
          className={`w-16 md:w-20 shrink-0 text-right text-[10px] md:text-[11px] tracking-widest ${s.text}`}
        >
          {preuves.length === 0
            ? "———"
            : `${preuves.length} PRJ`}
        </span>

        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-red-600/60 text-xs shrink-0"
          aria-hidden="true"
        >
          ▶
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            {/* Un briefing long étirait la carte secteur sur plus d'un écran
                et repoussait les compétences suivantes hors de vue. À partir
                de md le panneau est plafonné et le débordement scrolle sur
                place ; en dessous, le flux naturel reste plus lisible. */}
            <div className="px-3 md:px-4 pb-5 pt-1 grid gap-5 md:grid-cols-2 bg-black/40 md:max-h-[min(20rem,50vh)] md:overflow-y-auto md:[scrollbar-width:thin] md:[scrollbar-color:var(--color-red-600)_transparent]">
              <div>
                <div className="text-[10px] text-red-500 tracking-[0.3em] mb-2">
                  {`// BRIEFING ${activite.code}`}
                </div>
                <p className="text-[11px] md:text-xs font-black text-white uppercase tracking-wide mb-2">
                  {activite.title}
                </p>
                <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
                  {activite.description}
                </p>
              </div>

              <div>
                <div className="text-[10px] text-red-500 tracking-[0.3em] mb-2">
                  {"// PREUVES"}
                </div>
                {preuves.length === 0 ? (
                  <p className="text-xs md:text-sm text-yellow-400/80 leading-relaxed">
                    Aucun projet publié ne couvre encore cette compétence.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {preuves.map((p) => (
                      <li key={p.projectId}>
                        {/* Toute la box est cliquable, titre comme preuve. */}
                        <button
                          type="button"
                          onClick={() => onOpenProject(p.projectId)}
                          className="group block w-full text-left border border-red-600/30 hover:border-red-600/70 bg-neutral-950 hover:bg-neutral-900 px-3 py-2 transition-colors cursor-pointer"
                        >
                          <span className="block text-xs md:text-sm font-black text-red-500 group-hover:text-red-400 transition-colors uppercase tracking-wide">
                            ◉ {p.title}
                          </span>
                          {p.evidence && (
                            <span className="block text-[11px] md:text-xs text-neutral-400 mt-1 leading-relaxed">
                              {p.evidence}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectorPanel({
  bloc,
  preuvesIndex,
  openCode,
  onToggleCode,
  onOpenProject,
}: {
  bloc: Bloc;
  preuvesIndex: PreuvesIndex;
  openCode: string | null;
  onToggleCode: (code: string) => void;
  onOpenProject: (projectId: string) => void;
}) {
  const covered = bloc.competences.filter(
    (c) => (preuvesIndex.get(c.code)?.length ?? 0) > 0,
  ).length;
  const pct = covered / bloc.competences.length;

  return (
    // Cible de `focusCompetence`. L'ancre est portée par un wrapper neutre : le
    // motion.div se translate pendant son animation d'entrée, viser directement
    // dessus donnerait une position de scroll mouvante.
    <div id={blocAnchorId(bloc.code)} className="scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.15 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="border-2 border-red-600 bg-black/90 font-mono shadow-[0_0_40px_rgba(220,38,38,0.15)]"
      >
        <div className="flex items-center justify-between gap-3 border-b-2 border-red-600 bg-red-600 text-black px-3 py-1.5 text-[10px] sm:text-sm font-black tracking-widest uppercase">
          <span className="shrink-0">
            S{bloc.sector} — {bloc.code}
          </span>
          <span className="truncate text-right sm:text-center flex-1 normal-case sm:uppercase">
            {bloc.title}
          </span>
          <span className="hidden md:inline shrink-0">
            {covered}/{bloc.competences.length}
          </span>
        </div>

        <div className="flex items-center gap-4 px-3 md:px-4 py-3 border-b border-red-600/20">
          <CoverageRing pct={pct} />
          <div className="min-w-0">
            <div className="text-[9px] tracking-[0.3em] text-neutral-500 mb-1">
              COUVERTURE SECTEUR
            </div>
            <div className="text-xs md:text-sm text-neutral-300">
              <span className="text-white font-black">{covered}</span>
              <span className="text-neutral-500">
                {" "}
                / {bloc.competences.length} compétences adossées à un projet
              </span>
            </div>
          </div>
        </div>

        <div>
          {bloc.competences.map((c) => (
            <CompetenceRow
              key={c.code}
              competence={c}
              preuves={preuvesIndex.get(c.code) ?? []}
              isOpen={openCode === c.code}
              onToggle={() => onToggleCode(c.code)}
              onOpenProject={onOpenProject}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function Competences() {
  const [projects, setProjects] = useState<ProjectLite[]>([]);
  // Ouverture pilotée par le contexte : une compétence cliquée depuis une
  // modale projet doit pouvoir déplier la bonne ligne d'ici.
  const { openCompetence, toggleCompetence, focusProject } =
    usePortfolioFocus();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/projects")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.projects) return;
        setProjects(data.projects);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const preuvesIndex = useMemo<PreuvesIndex>(() => {
    const index: PreuvesIndex = new Map();
    for (const project of projects) {
      for (const link of project.competences ?? []) {
        const list = index.get(link.code) ?? [];
        list.push({
          projectId: project.id,
          title: project.title,
          evidence: link.evidence,
        });
        index.set(link.code, list);
      }
    }
    return index;
  }, [projects]);

  const totalCovered = useMemo(
    () =>
      BLOCS.reduce(
        (acc, bloc) =>
          acc +
          bloc.competences.filter(
            (c) => (preuvesIndex.get(c.code)?.length ?? 0) > 0,
          ).length,
        0,
      ),
    [preuvesIndex],
  );

  return (
    <section
      id="competences"
      aria-labelledby="competences-title"
      className="relative bg-black py-16 md:py-24 overflow-hidden"
    >
      {/* scanlines — même traitement broadcast que les pit boards */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.08] z-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 container mx-auto px-4 md:px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <h2
            id="competences-title"
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            <span className="text-red-600">MES</span>{" "}
            <span className="text-white">COMPÉTENCES</span>
          </h2>
          <p className="font-mono text-[10px] md:text-xs tracking-[0.3em] text-neutral-500 uppercase">
            Référentiel développeur web — 3 secteurs / {TOTAL_COMPETENCES}{" "}
            compétences
          </p>
        </motion.div>

        {/* Bandeau chrono global */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="font-mono border border-red-600/40 bg-neutral-950 px-4 py-3 mb-6 md:mb-8 flex flex-wrap items-center justify-between gap-3 text-[10px] md:text-xs tracking-widest"
        >
          <span className="flex items-center gap-2 text-green-500">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]"
            />
            LAP COMPLETE
          </span>
          <span className="text-neutral-500">
            COUVERTURE TOTALE{" "}
            <span className="text-white font-black">
              {totalCovered}/{TOTAL_COMPETENCES}
            </span>
          </span>
          <span className="text-neutral-500">
            PROJETS{" "}
            <span className="text-white font-black">{projects.length}</span>
          </span>
        </motion.div>

        <div className="space-y-6 md:space-y-8">
          {BLOCS.map((bloc) => (
            <SectorPanel
              key={bloc.code}
              bloc={bloc}
              preuvesIndex={preuvesIndex}
              openCode={openCompetence}
              onToggleCode={toggleCompetence}
              onOpenProject={focusProject}
            />
          ))}
        </div>

        {/* Légende chrono */}
        <div className="mt-6 md:mt-8 font-mono flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] tracking-widest text-neutral-500">
          <span className="flex items-center gap-2">
            <span className="w-4 h-1.5 bg-purple-500 shadow-[0_0_6px_#a855f7]" />
            2+ PROJETS
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-1.5 bg-green-500 shadow-[0_0_6px_#22c55e]" />
            1 PROJET
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-1.5 bg-yellow-400 shadow-[0_0_6px_#facc15]" />
            À COUVRIR
          </span>
        </div>
      </div>
    </section>
  );
}
