"use client";

import { ALL_COMPETENCES, BLOCS } from "@/utils/competences";
import { AnimatePresence, motion } from "framer-motion";
import type { ProjectCompetenceLink } from "./types";

interface CompetencesPickerProps {
  value: ProjectCompetenceLink[];
  onChange: (next: ProjectCompetenceLink[]) => void;
}

export function CompetencesPicker({ value, onChange }: CompetencesPickerProps) {
  const byCode = new Map(value.map((c) => [c.code, c]));

  const toggle = (code: string) => {
    if (byCode.has(code)) {
      onChange(value.filter((c) => c.code !== code));
      return;
    }
    // On garde la liste dans l'ordre du référentiel, pas dans l'ordre des clics.
    const next = [...value, { code, evidence: null }];
    const rank = new Map(ALL_COMPETENCES.map((c, i) => [c.code, i]));
    next.sort((a, b) => (rank.get(a.code) ?? 0) - (rank.get(b.code) ?? 0));
    onChange(next);
  };

  const setEvidence = (code: string, evidence: string) => {
    onChange(
      value.map((c) =>
        c.code === code ? { ...c, evidence: evidence || null } : c,
      ),
    );
  };

  return (
    <div className="space-y-2">
      {BLOCS.map((bloc) => {
        const selected = bloc.competences.filter((c) =>
          byCode.has(c.code),
        ).length;

        return (
          <details
            key={bloc.code}
            open={selected > 0}
            className="rounded-md border border-red-600/20 bg-gray-900/40"
          >
            <summary className="cursor-pointer select-none px-3 py-2.5 flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-red-500">
                {bloc.code}
              </span>
              <span className="flex-1 text-sm text-gray-300 truncate">
                {bloc.title}
              </span>
              <span
                className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-mono ${
                  selected > 0
                    ? "bg-red-600/20 text-red-300"
                    : "bg-gray-800 text-gray-500"
                }`}
              >
                {selected}/{bloc.competences.length}
              </span>
            </summary>

            <div className="px-3 pb-3 pt-1 space-y-1">
              {bloc.competences.map((competence) => {
                const link = byCode.get(competence.code);
                const checked = link !== undefined;

                return (
                  <div key={competence.code}>
                    <label className="flex items-start gap-3 px-2 py-2 rounded-md cursor-pointer hover:bg-white/5 transition-colors">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(competence.code)}
                        className="mt-0.5 w-4 h-4 shrink-0 accent-red-600 cursor-pointer"
                      />
                      <span className="font-mono text-xs text-red-500/80 shrink-0 w-10 mt-0.5">
                        {competence.code}
                      </span>
                      <span className="flex-1 text-sm text-gray-300 leading-snug">
                        {competence.label}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] text-gray-600 mt-0.5">
                        {competence.activite}
                      </span>
                    </label>

                    <AnimatePresence initial={false}>
                      {checked && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-9 pr-2 pb-2">
                            <input
                              type="text"
                              value={link?.evidence ?? ""}
                              onChange={(e) =>
                                setEvidence(competence.code, e.target.value)
                              }
                              placeholder="Preuve — ex. « Paiement Stripe + webhooks signés »"
                              className="w-full px-2.5 py-1.5 bg-gray-950 border border-red-600/20 rounded text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-red-600"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </details>
        );
      })}
    </div>
  );
}
