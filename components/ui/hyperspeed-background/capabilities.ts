/**
 * Decide *avant* de telecharger three.js si la machine peut afficher la scene.
 *
 * Le probleme qu'on resout : la scene est un rendu WebGL plein ecran avec une
 * passe de bloom. Sur une machine avec GPU c'est gratuit ; sans GPU le
 * navigateur bascule sur un rasteriseur logiciel (SwiftShader, llvmpipe) qui
 * rasterise chaque frame sur le thread principal. La page devient injouable et
 * le TBT explose. C'est le cas des Chrome headless (PageSpeed Insights), des
 * VM, des machines a GPU desactive — et de certains navigateurs in-app.
 */

export type HeroQuality = "high" | "low" | "off";

/** GPU logiciels connus : le rendu passe par le CPU, donc par le thread principal. */
const SOFTWARE_RENDERERS =
  /swiftshader|llvmpipe|software|basic render|microsoft basic|mesa offscreen/i;

function prefersReducedMotion(): boolean {
  return (
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
  );
}

/**
 * Sonde un contexte WebGL jetable. Retourne le nom du GPU, ou `null` si WebGL
 * est indisponible ou uniquement disponible en rendu logiciel.
 */
function probeRenderer(): string | null {
  const canvas = document.createElement("canvas");
  // `failIfMajorPerformanceCaveat` demande au navigateur de refuser le contexte
  // plutot que de le servir en rendu logiciel. C'est l'API prevue pour ca.
  const attrs: WebGLContextAttributes = {
    failIfMajorPerformanceCaveat: true,
    alpha: true,
  };

  let gl: WebGLRenderingContext | null = null;
  try {
    gl =
      (canvas.getContext("webgl2", attrs) as WebGLRenderingContext | null) ??
      (canvas.getContext("webgl", attrs) as WebGLRenderingContext | null);
  } catch {
    return null;
  }
  if (!gl) return null;

  // Certains builds ignorent `failIfMajorPerformanceCaveat` et servent quand
  // meme SwiftShader : on verifie le nom du renderer en second filet.
  let renderer = "";
  try {
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    renderer = ext
      ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL))
      : String(gl.getParameter(gl.RENDERER));
  } catch {
    renderer = "";
  }

  // Un contexte WebGL est une ressource rare sur mobile (souvent 8 a 16 max) :
  // on libere la sonde immediatement.
  gl.getExtension("WEBGL_lose_context")?.loseContext();

  return SOFTWARE_RENDERERS.test(renderer) ? null : renderer;
}

/** Heuristique "petit appareil" : peu de coeurs ou peu de RAM. */
function isLowEndDevice(): boolean {
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;

  if (cores <= 4) return true;
  if (typeof memory === "number" && memory <= 4) return true;

  return false;
}

/**
 * `high` : scene complete avec bloom.
 * `low`  : scene sans post-processing, resolution et framerate reduits.
 * `off`  : pas de WebGL du tout, on affiche le fond statique.
 */
export function detectHeroQuality(): HeroQuality {
  if (typeof window === "undefined") return "off";
  if (prefersReducedMotion()) return "off";
  if (probeRenderer() === null) return "off";

  return isLowEndDevice() ? "low" : "high";
}
