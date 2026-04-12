"use client";

import BorderGlow from "@/components/border-glow/BorderGlow";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalTrigger,
} from "@/components/ui/shadcn-io/animated-modal";
import {
  PLACEHOLDER_IMAGE,
  type Project,
  projects as fallbackProjects,
} from "@/utils/my_project";
import { MotionValue, motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useCheckerboardColumns } from "@/hooks/useCheckerboardColumns";
import { useIsInViewport } from "@/hooks/useIsInViewport";
import { useScrollSnap } from "@/hooks/useScrollSnap";

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

function useProject(value: MotionValue<number>, distance: number) {
  return useTransform(value, [0, 1], [-distance, distance]);
}

function ProjectImage({
  project,
  position,
}: {
  project: Project;
  position: number;
}) {
  const ref = useRef(null);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useProject(scrollYProgress, isMobile ? 100 : 300);

  const isOdd = position % 2 === 1;
  const offsetX = isMobile ? 0 : isOdd ? -200 : 200;
  const numberOffsetX = isMobile ? 0 : isOdd ? 200 : -200;

  return (
    <Modal>
      <section className="h-screen snap-start flex justify-center items-center relative overflow-hidden">
        {/* Transition fade-in depuis le haut */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {/* Starting block - délimitations */}
          <motion.div
            className="relative border-4 border-black  rounded-lg p-2  z-10 hover:scale-105 transition-transform duration-300"
            style={{ x: offsetX }}
          >
            {/* Lignes de délimitation du starting block */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[120%] h-1 bg-white rounded-full pointer-events-none" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[120%] h-1 bg-white rounded-full pointer-events-none" />
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-[120%] bg-white rounded-full pointer-events-none" />
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-[120%] bg-white rounded-full pointer-events-none" />

            {/* Numéro de position F1 (P1, P2, etc.) */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none">
              <span className="text-white font-black text-2xl font-mono">
                P{position}
              </span>
            </div>

            <ModalTrigger className="w-full h-full cursor-pointer bg-transparent border-none p-0">
              <div
                ref={ref}
                className="w-[200px] h-[280px] sm:w-[220px] sm:h-[300px] md:w-[300px] md:h-[400px] bg-gray-100 overflow-hidden relative border-2 border-white/20"
              >
                <Image
                  src={project.image || PLACEHOLDER_IMAGE}
                  alt={project.title}
                  width={300}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
            </ModalTrigger>
          </motion.div>
        </motion.div>

        <motion.h2
          initial={{ visibility: "hidden" }}
          animate={{ visibility: "visible" }}
          style={{ y, x: numberOffsetX }}
          className="text-red-600 m-0 font-mono text-[28px] sm:text-[36px] md:text-[50px] font-bold tracking-[-2px] md:tracking-[-3px] leading-tight absolute inline-block top-[calc(50%-25px)] left-1/2 -translate-x-1/2 z-20 max-w-[90vw] text-center"
        >{`# ${project.title}`}</motion.h2>

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
              <div className="space-y-6">
                <div className="relative w-full h-40 sm:h-52 md:h-64 mb-4 md:mb-6 rounded-lg overflow-hidden">
                  <Image
                    src={project.image || PLACEHOLDER_IMAGE}
                    alt={project.title}
                    width={800}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-red-600">
                    {project.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {project.description}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-red-600/10 text-red-600 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {(project.link || project.github) && (
                    <div className="mt-6 flex gap-4">
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Voir le projet
                        </a>
                      )}
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          GitHub
                        </a>
                      )}
                    </div>
                  )}
                </div>
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
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-7xl md:text-9xl font-black text-white" />
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
        <ProjectImage
          key={project.id}
          project={project}
          position={index + 1}
        />
      ))}
    </div>
  );
}
