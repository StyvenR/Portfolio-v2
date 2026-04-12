"use client";

import { motion } from "motion/react";

export default function About() {
  return (
    <section
      id="a-propos"
      className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 py-20 md:py-28 relative overflow-x-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto max-w-3xl flex flex-col items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-2xl mx-auto text-center flex flex-col items-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-8 md:mb-10">
            <span className="text-red-600">À PROPOS</span>
          </h2>

          <div className="w-full space-y-5 md:space-y-6 text-base md:text-lg text-gray-200 leading-relaxed text-center">
            <p>
              En fin d&apos;apprentissage, je regarde le chemin parcouru avec
              l&apos;envie d&apos;aller encore plus loin. Au fil de cette
              expérience, et plus particulièrement durant mon alternance,
              j&apos;ai consolidé mes compétences en{" "}
              <span className="text-white font-bold">TypeScript</span>,
              approfondi ma stack autour de{" "}
              <span className="text-white font-bold">Next.js</span> et renforcé
              ma maîtrise de l&apos;écosystème JavaScript à travers des projets
              concrets.
            </p>
            <p>
              Ce que j&apos;aime avant tout, c&apos;est concevoir des projets
              utiles, soignées et performantes, tout en avançant au sein
              d&apos;équipes où l&apos;on apprend ensemble. J&apos;ai également
              eu l&apos;occasion de travailler avec des outils et APIs externes
              comme <span className="text-white font-bold">Zapier</span>,{" "}
              <span className="text-white font-bold">Make</span> et{" "}
              <span className="text-white font-bold">n8n</span>, ce qui m&apos;a
              permis d&apos;élargir ma vision du développement et de
              l&apos;automatisation.
            </p>
            <p className="text-gray-300">
              Je m&apos;appelle{" "}
              <span className="text-white font-bold">Styven RAYA</span>,
              j&apos;ai 22&nbsp;ans et je suis en fin d&apos;apprentissage. Je
              recherche actuellement un{" "}
              <span className="text-red-500/95">emploi de développeur web</span>
              .
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-2 w-full">
              <motion.a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-5 py-2.5 md:px-6 md:py-3 bg-red-600 text-white text-sm md:text-base font-bold tracking-wide hover:bg-red-700 transition-colors border-2 border-red-600 rounded-lg"
              >
                VOIR MON CV
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/in/styven-raya-ab5312302/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-5 py-2.5 md:px-6 md:py-3 bg-red-600 text-white text-sm md:text-base font-bold tracking-wide hover:bg-red-700 transition-colors border-2 border-red-600 rounded-lg"
              >
                LINKEDIN
              </motion.a>
              <motion.a
                href="https://github.com/StyvenR"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-5 py-2.5 md:px-6 md:py-3 bg-red-600 text-white text-sm md:text-base font-bold tracking-wide hover:bg-red-700 transition-colors border-2 border-red-600 rounded-lg"
              >
                GITHUB
              </motion.a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
