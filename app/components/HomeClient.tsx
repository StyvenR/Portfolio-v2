"use client";

import LogoLoop from "@/components/ui/logo-loop/LogoLoop";
import { Menu, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import About from "./About";
import Competences from "./Competences";
import Contact from "./Contact";
import HeroBackground from "./HeroBackground";
import Project from "./Projet";

const NAV_LINKS = [
  { href: "#projets", label: "Projets" },
  { href: "#competences", label: "Compétences" },
  { href: "#a-propos", label: "À propos" },
  { href: "#contact", label: "Contact" },
];

export default function HomeClient() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <header
        role="banner"
        className="fixed top-0 w-full z-50 bg-black/95 border-b border-red-600/20"
      >
        <nav
          aria-label="Navigation principale"
          className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl md:text-2xl font-bold tracking-wider"
          >
            <span className="text-red-600">STYVEN</span>
            <span className="text-white">RAYA</span>
          </motion.div>
          <motion.ul
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex md:gap-8 text-sm font-medium"
          >
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="hover:text-red-600 transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </motion.ul>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="md:hidden -mr-2 p-2 hover:text-red-600 transition-colors"
          >
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </nav>

        {menuOpen && (
          <ul
            id="mobile-menu"
            className="md:hidden px-4 pb-2 border-t border-red-600/20 bg-black/95"
          >
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-4 text-base font-medium border-b border-white/5 last:border-b-0 hover:text-red-600 transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>

      <main id="main">
        <section
          id="hero"
          aria-label="Présentation"
          className="relative h-screen flex items-center justify-center overflow-hidden bg-black"
        >
          <div
            className="absolute inset-0"
            style={{
              maskImage:
                "linear-gradient(to bottom, black 0%, black 50%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 0%, black 50%, transparent 100%)",
              maskSize: "100% 100%",
              WebkitMaskSize: "100% 100%",
            }}
            aria-hidden="true"
          >
            <HeroBackground />
          </div>

          <div className="relative z-10 text-center px-4 md:px-6">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-9xl font-black mb-4 md:mb-6 tracking-tight"
            >
              <span className="text-red-600">WEB</span>
              <br />
              <span className="text-white">EN</span>
              <br />
              <span className="text-red-600">MOUVEMENT</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base md:text-xl lg:text-2xl text-gray-400 mb-6 md:mb-8 max-w-2xl mx-auto"
            >
              Là où certains voient un problème, je vois une opportunité de
              coder une solution.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            aria-hidden="true"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-6 h-10 border-2 border-red-600 rounded-full flex justify-center"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 h-3 bg-red-600 rounded-full mt-2"
              />
            </motion.div>
          </motion.div>
        </section>

        <section
          id="projets"
          aria-labelledby="projets-title"
          className="relative overflow-hidden bg-black"
        >
          <div className="relative container mx-auto py-16 z-40">
            <motion.h2
              id="projets-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-3xl md:text-5xl font-bold mb-8 md:mb-16 text-center"
              style={{
                textShadow:
                  "0 2px 10px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div className="py-24 md:py-40 lg:py-60">
                <span className="text-red-600">MES</span>{" "}
                <span className="text-white">PROJETS</span>
              </div>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.8 }}
            className="absolute top-0 left-0 right-0 h-32 md:h-40 pointer-events-none z-30 bg-black"
            aria-hidden="true"
          />

          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "20px" }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute left-0 top-0 bottom-0 border-r-2 md:border-r-4 bg-black"
            aria-hidden="true"
          />
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "20px" }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute right-0 top-0 bottom-0 border-l-2 md:border-l-4 bg-black"
            aria-hidden="true"
          />
          <div className="relative z-20">
            <Project />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.8 }}
            className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-30"
            style={{
              background:
                "linear-gradient(to top, #000000, rgba(0, 0, 0, 0.8), transparent)",
            }}
            aria-hidden="true"
          />
        </section>

        <section
          aria-label="Technologies et outils"
          className="py-12 md:py-20 bg-black border-y border-red-600/20 overflow-hidden"
        >
          <div className="mb-8 text-center">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-gray-400 text-sm uppercase tracking-widest mb-2"
            >
              Technologies & outils
            </motion.p>
          </div>
          <LogoLoop
            logos={[
              {
                src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
                alt: "React",
              },
              {
                src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
                alt: "Next.js",
              },
              {
                src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
                alt: "TypeScript",
              },
              {
                src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
                alt: "Tailwind CSS",
              },
              {
                src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
                alt: "Node.js",
              },
              {
                src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
                alt: "PostgreSQL",
              },
              {
                src: "https://cdn.simpleicons.org/prisma/2D3748",
                alt: "Prisma",
              },
              {
                src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
                alt: "Git",
              },
              {
                src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
                alt: "JavaScript",
              },
              {
                src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
                alt: "PHP",
              },
              {
                src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg",
                alt: "C",
              },
            ]}
            speed={80}
            direction="left"
            logoHeight={56}
            gap={56}
            pauseOnHover
            fadeOut
            fadeOutColor="rgba(0,0,0,1)"
            className="opacity-90"
            ariaLabel="Technologies utilisées"
          />
        </section>

        <Competences />

        <About />

        <Contact />
      </main>

      <footer
        role="contentinfo"
        className="border-t border-red-600/20 py-8 md:py-12 px-4 md:px-6"
      >
        <div className="container mx-auto text-center">
          <div className="text-2xl font-bold mb-4">
            <span className="text-red-600">STYVEN RAYA</span> <br />
            <span className="text-white">PORTFOLIO 2026</span>
          </div>
          <p className="text-gray-500 text-sm mb-6">© 2026 - Design</p>
          <div className="flex justify-center gap-6">
            <motion.a
              href="https://www.linkedin.com/in/styven-raya-ab5312302/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Profil LinkedIn de Styven Raya"
              whileHover={{ scale: 1.1, color: "#dc2626" }}
              className="text-gray-500 hover:text-red-600 transition-colors text-sm"
            >
              LinkedIn
            </motion.a>
            <motion.a
              href="https://github.com/StyvenR"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Profil GitHub de Styven Raya"
              whileHover={{ scale: 1.1, color: "#dc2626" }}
              className="text-gray-500 hover:text-red-600 transition-colors text-sm"
            >
              GitHub
            </motion.a>
          </div>
        </div>
      </footer>
    </div>
  );
}
