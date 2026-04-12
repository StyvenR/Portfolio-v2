"use client";

import BorderGlow from "@/components/border-glow/BorderGlow";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalTrigger,
} from "@/components/ui/shadcn-io/animated-modal";
import { useCheckerboardColumns } from "@/hooks/useCheckerboardColumns";
import { useIsInViewport } from "@/hooks/useIsInViewport";
import { useScrollSnap } from "@/hooks/useScrollSnap";
import {
  PLACEHOLDER_IMAGE,
  projects as fallbackProjects,
  type Project,
} from "@/utils/my_project";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

function PitBoard({
  project,
  position,
  total,
}: {
  project: Project;
  position: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const fill = useTransform(scrollYProgress, [0.2, 0.6], [0, 1]);
  const perfPct = useTransform(fill, (v) => `${Math.round(v * 87)}%`);

  const lap = String(position).padStart(2, "0");
  const laps = String(total).padStart(2, "0");

  return (
    <Modal>
      <section className="h-screen snap-start flex justify-center items-center relative overflow-hidden bg-black">
        {/* scanlines overlay F1 broadcast */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08] z-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)",
          }}
        />

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-[92vw] max-w-[1100px] border-2 border-red-600 bg-black/90 font-mono shadow-[0_0_40px_rgba(220,38,38,0.25)]"
        >
          {/* Header pit board */}
          <div className="flex items-center justify-between border-b-2 border-red-600 bg-red-600 text-black px-3 py-1.5 text-[11px] sm:text-sm font-black tracking-widest uppercase">
            <span>P{position}</span>
            <span className="hidden sm:inline">
              LAP {lap}/{laps}
            </span>
            <span className="flex items-center gap-2">
              <motion.span
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-black"
              />
              REC
            </span>
          </div>

          {/* Body split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image écran télémétrie */}
            <ModalTrigger className="group relative block w-full aspect-4/3 md:aspect-auto md:h-[360px] overflow-hidden border-b-2 md:border-b-0 md:border-r-2 border-red-600 bg-neutral-900 cursor-pointer p-0">
              {/* coins style HUD */}
              <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-red-500 z-10" />
              <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-red-500 z-10" />
              <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-red-500 z-10" />
              <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-red-500 z-10" />
              <Image
                src={project.image || PLACEHOLDER_IMAGE}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 92vw, 550px"
                className="object-contain object-center p-4 group-hover:scale-[1.03] transition-transform duration-500"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 border border-red-600 text-[10px] text-red-500 tracking-widest z-10">
                ONBOARD CAM
              </div>
            </ModalTrigger>

            {/* Data panel */}
            <div className="p-4 md:p-6 flex flex-col gap-4 text-white">
              <div>
                <h2 className="text-2xl md:text-4xl font-black text-red-600 leading-none">
                  # {project.title}
                </h2>
              </div>

              <div>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 border border-red-600/60 text-red-400 text-[10px] sm:text-xs tracking-wide uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Télémétrie — RPM gauge + LED cluster */}
              <div className="grid grid-cols-5 gap-3 items-center">
                {/* Jauge RPM semi-circulaire */}
                <div className="col-span-2 relative aspect-square max-w-[160px]">
                  <svg
                    viewBox="0 0 120 120"
                    className="w-full h-full -rotate-90"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#262626"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="8"
                      strokeLinecap="butt"
                      strokeDasharray="314"
                      style={{
                        strokeDashoffset: useTransform(
                          fill,
                          (v) => 314 - v * 0.87 * 314,
                        ),
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span className="text-2xl md:text-3xl font-black text-red-500 leading-none">
                      {perfPct}
                    </motion.span>
                    <span className="text-[9px] tracking-[0.3em] text-neutral-500 mt-1">
                      PERF
                    </span>
                  </div>
                </div>

                {/* LED cluster */}
                <div className="col-span-3 space-y-2 text-[10px] tracking-widest">
                  <div className="flex items-center justify-between border-b border-red-600/20 pb-1.5">
                    <span className="text-neutral-500">STATUS</span>
                    <span className="flex items-center gap-1.5 text-green-500">
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]"
                      />
                      LIVE
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-red-600/20 pb-1.5">
                    <span className="text-neutral-500">LAP</span>
                    <span className="text-white">
                      {lap}/{laps}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-red-600/20 pb-1.5">
                    <span className="text-neutral-500">SECTOR</span>
                    <span className="flex gap-1">
                      {(() => {
                        const PALETTE = [
                          "bg-purple-500 shadow-[0_0_6px_#a855f7]",
                          "bg-green-500 shadow-[0_0_6px_#22c55e]",
                          "bg-yellow-400 shadow-[0_0_6px_#facc15]",
                          "bg-red-500 shadow-[0_0_6px_#ef4444]",
                        ];
                        const MIX: Record<number, number[]> = {
                          1: [0, 0, 0],
                          2: [0, 1, 1],
                          3: [1, 1, 2],
                          4: [1, 2, 2],
                          5: [2, 2, 3],
                          6: [2, 3, 3],
                        };
                        const pattern = MIX[position] ?? [3, 3, 3];
                        return pattern.map((p, i) => (
                          <span key={i} className={`w-4 h-1.5 ${PALETTE[p]}`} />
                        ));
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">POS</span>
                    <span className="text-red-500 font-black text-base leading-none">
                      {(position % 8).toString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-auto flex items-center gap-2 pt-2 border-t border-red-600/30 text-[10px] tracking-widest text-neutral-500">
                <span className="text-red-500">◉</span>
                <span>TAP ONBOARD CAM → VIEW TEAM RADIO</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Titre latéral décoratif (desktop) */}
        {!isMobile && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-red-600/30 font-mono text-xs tracking-[0.5em] pointer-events-none">
            SECTOR {position} — {project.title.toUpperCase()}
          </div>
        )}

        {/* Modal avec contenu du projet */}
        <ModalBody>
          <BorderGlow
            glowColor="0 85 55"
            colors={["#dc2626", "#f87171", "#b91c1c"]}
            backgroundColor="#000000"
            borderRadius={24}
            glowRadius={24}
            glowIntensity={1.2}
            animated
            className="flex-1 flex flex-col min-h-0"
          >
            <ModalContent>
              <div className="font-mono text-white">
                {/* Broadcast header */}
                <div className="flex items-center justify-between border-b-2 border-red-600 bg-red-600 text-black px-3 py-1.5 text-[11px] sm:text-sm font-black tracking-widest uppercase -mx-6 -mt-6 mb-4">
                  <span>P{position} — TEAM RADIO</span>
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-black"
                    />
                    ON AIR
                  </span>
                </div>

                {/* Image centrée avec HUD */}
                <div className="relative w-full h-48 sm:h-64 md:h-72 mb-5 overflow-hidden bg-neutral-900 border border-red-600/60 flex items-center justify-center">
                  <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-red-500 z-10" />
                  <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-red-500 z-10" />
                  <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-red-500 z-10" />
                  <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-red-500 z-10" />
                  <Image
                    src={project.image || PLACEHOLDER_IMAGE}
                    alt={project.title}
                    width={1200}
                    height={700}
                    className="max-w-full max-h-full w-auto h-auto object-contain"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 border border-red-600 text-[10px] text-red-500 tracking-widest z-10">
                    REPLAY — {project.title.toUpperCase()}
                  </div>
                </div>

                {/* Title + desc */}
                <div className="mb-5">
                  <div className="text-[10px] text-red-500 tracking-[0.3em] mb-1">
                    {"// BRIEFING"}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-red-600 mb-3">
                    # {project.title}
                  </h2>
                  <p className="text-neutral-300 text-sm md:text-base leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Stack */}
                <div className="mb-5">
                  <div className="text-[10px] text-red-500 tracking-[0.3em] mb-2">
                    {"// STACK"}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 border border-red-600/60 text-red-400 text-[10px] sm:text-xs tracking-wide uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {(project.link || project.github) && (
                  <div className="pt-4 border-t border-red-600/30 flex flex-wrap gap-3">
                    {project.link && project.link !== "blank" && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-black font-black text-xs tracking-widest uppercase transition-colors"
                      >
                        ◉ LIVE RUN
                      </a>
                    )}
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border border-red-600 text-red-500 hover:bg-red-600 hover:text-black font-black text-xs tracking-widest uppercase transition-colors"
                      >
                        ⌥ GITHUB
                      </a>
                    )}
                  </div>
                )}
              </div>
            </ModalContent>
          </BorderGlow>
        </ModalBody>
      </section>
    </Modal>
  );
}

function FinishLine() {
  const checkerboardSize = 40;
  const rows = 2;
  const columns = useCheckerboardColumns(checkerboardSize);

  const squares = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const isBlack = (row + col) % 2 === 0;
      squares.push(
        <div
          key={`${row}-${col}`}
          className={`absolute ${isBlack ? "bg-black" : "bg-white"}`}
          style={{
            left: `${col * checkerboardSize}px`,
            top: `${row * checkerboardSize}px`,
            width: `${checkerboardSize}px`,
            height: `${checkerboardSize}px`,
          }}
        />,
      );
    }
  }

  const sectionHeight = rows * checkerboardSize;

  return (
    <section
      className="snap-start relative bg-black overflow-hidden p-0 m-0"
      style={{ height: `${sectionHeight}px` }}
    >
      <div className="absolute inset-0">
        <div
          className="absolute top-0 left-0 right-0 w-full overflow-hidden p-0 m-0"
          style={{ height: `${sectionHeight}px` }}
        >
          {squares}
        </div>
      </div>
    </section>
  );
}

export default function Project() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInZone = useIsInViewport(containerRef);
  useScrollSnap(containerRef, {
    enabled: isInZone,
    threshold: 50,
    cooldown: 600,
  });

  const [projects, setProjects] = useState<Project[]>(fallbackProjects);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/projects")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.projects?.length) return;
        setProjects(data.projects);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="example"
      className={isInZone ? "snap-y snap-mandatory" : ""}
      style={{
        scrollSnapType: isInZone ? "y mandatory" : "none",
        scrollPaddingTop: "0",
        scrollPaddingBottom: "0",
      }}
    >
      <FinishLine />
      {projects.map((project, index) => (
        <PitBoard
          key={project.id}
          project={project}
          position={index + 1}
          total={projects.length}
        />
      ))}
    </div>
  );
}
