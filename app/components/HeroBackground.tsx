"use client";

import {
  detectHeroQuality,
  type HeroQuality,
} from "@/components/ui/hyperspeed-background/capabilities";
import { hyperspeedPresets } from "@/components/ui/hyperspeed-background/HyperSpeedPresets";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// three.js (622 Ko) + postprocessing (210 Ko) representaient 63% du JS initial
// de la page alors qu'ils ne servent qu'a un fond decoratif. En import
// dynamique ils sortent du bundle d'hydratation, et le chunk n'est meme pas
// telecharge quand la machine ne peut pas afficher la scene.
const Hyperspeed = dynamic(
  () => import("@/components/ui/hyperspeed-background/Hyperspeed"),
  { ssr: false, loading: () => null },
);

/**
 * Fond statique : rendu par le serveur, visible immediatement, et seul fond
 * affiche sur les machines sans GPU. Il reprend les tons du preset pour que la
 * bascule vers la scene WebGL ne se voie pas.
 */
function StaticBackdrop() {
  return (
    <div
      className="absolute inset-0 bg-black"
      style={{
        backgroundImage: [
          "radial-gradient(ellipse 70% 45% at 50% 78%, rgba(220,38,38,0.35), transparent 70%)",
          "radial-gradient(ellipse 35% 60% at 22% 65%, rgba(190,24,93,0.18), transparent 72%)",
          "radial-gradient(ellipse 35% 60% at 78% 65%, rgba(37,99,235,0.14), transparent 72%)",
        ].join(","),
      }}
    />
  );
}

export default function HeroBackground() {
  // On demarre a "off" : le premier rendu (serveur et client) est le fond
  // statique, identique des deux cotes, donc pas de mismatch d'hydratation.
  const [quality, setQuality] = useState<HeroQuality>("off");

  useEffect(() => {
    // La detection est repoussee apres l'hydratation : elle ne doit jamais
    // rentrer en concurrence avec le rendu du texte du hero (le LCP).
    let cancelled = false;
    const run = () => {
      if (!cancelled) setQuality(detectHeroQuality());
    };

    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(run, { timeout: 2000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback?.(handle);
      };
    }

    const timer = window.setTimeout(run, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <StaticBackdrop />
      {quality !== "off" && (
        <Hyperspeed
          effectOptions={hyperspeedPresets.two}
          quality={quality}
          // Un contexte perdu ou un renderer qui refuse de se creer ne doit
          // jamais faire tomber la page : on repasse simplement au fond fixe.
          onUnavailable={() => setQuality("off")}
        />
      )}
    </>
  );
}
