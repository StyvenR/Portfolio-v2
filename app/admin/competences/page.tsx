"use client";

import type { AdminProject } from "@/app/components/projects-admin/types";
import { BLOCS, TOTAL_COMPETENCES } from "@/utils/competences";
import { FolderKanban, Home, LogOut, MessageSquare } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useAdminAuth } from "../admin-auth-context";
import { ReadOnlyBadge } from "../read-only-badge";

export default function AdminCompetencesPage() {
  const router = useRouter();
  const { canEdit } = useAdminAuth();
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingCell, setSavingCell] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }, []);

  const fetchProjects = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem("auth_token");
        router.push("/admin/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [router, getToken]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const coveredCodes = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) {
      for (const c of p.competences) set.add(c.code);
    }
    return set;
  }, [projects]);

  const toggleCell = async (project: AdminProject, code: string) => {
    if (!canEdit) return;
    const token = getToken();
    if (!token) return;

    const cellKey = `${project.id}:${code}`;
    const has = project.competences.some((c) => c.code === code);
    const nextCompetences = has
      ? project.competences.filter((c) => c.code !== code)
      : [...project.competences, { code, evidence: null }];

    const previous = projects;
    setProjects((list) =>
      list.map((p) =>
        p.id === project.id ? { ...p, competences: nextCompetences } : p,
      ),
    );
    setSavingCell(cellKey);
    setError(null);

    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ competences: nextCompetences }),
      });
      if (!res.ok) throw new Error("Échec de l'enregistrement");
    } catch (err) {
      console.error(err);
      setProjects(previous);
      setError(
        err instanceof Error ? err.message : "Échec de l'enregistrement",
      );
    } finally {
      setSavingCell(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.push("/admin/login");
  };

  const gaps = TOTAL_COMPETENCES - coveredCodes.size;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-red-600/20 bg-black/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="text-red-600">ADMIN</span>{" "}
              <span className="text-white">COMPÉTENCES</span>
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-400">
                Matrice de couverture du référentiel
              </p>
              {!canEdit && <ReadOnlyBadge />}
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/projects"
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg transition-colors"
            >
              <FolderKanban className="w-4 h-4" />
              <span className="text-white">Projets</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-white">Messages</span>
            </Link>
            <motion.button
              onClick={() => router.push("/")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="text-white">Retour</span>
            </motion.button>
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </motion.button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center gap-4 mb-6 font-mono text-xs tracking-widest">
          <span className="px-3 py-1.5 rounded-md border border-green-600/40 text-green-400">
            COUVERTES {coveredCodes.size}/{TOTAL_COMPETENCES}
          </span>
          <span
            className={`px-3 py-1.5 rounded-md border ${
              gaps > 0
                ? "border-yellow-400/40 text-yellow-400"
                : "border-gray-700 text-gray-500"
            }`}
          >
            À COUVRIR {gaps}
          </span>
          <span className="px-3 py-1.5 rounded-md border border-red-600/30 text-gray-400">
            PROJETS {projects.length}
          </span>
          <span className="text-gray-600 normal-case tracking-normal">
            {canEdit
              ? "Clique une case pour rattacher une compétence à un projet. Les preuves textuelles s'éditent depuis la fiche projet."
              : "Consultation uniquement : votre compte ne peut pas modifier la matrice."}
          </span>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-400 bg-red-600/10 border border-red-600/30 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Chargement...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-red-600/20 rounded-lg">
            <p className="text-gray-400 mb-4">
              Crée d&apos;abord un projet pour pouvoir y rattacher des
              compétences.
            </p>
            <Link
              href="/admin/projects"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
            >
              <FolderKanban className="w-4 h-4" />
              Aller aux projets
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto border border-red-600/20 rounded-lg">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-950">
                  <th className="sticky left-0 z-20 bg-gray-950 text-left font-medium text-gray-400 px-4 py-3 border-b border-red-600/20 min-w-[280px]">
                    Compétence
                  </th>
                  {projects.map((p) => (
                    <th
                      key={p.id}
                      scope="col"
                      title={p.title}
                      className="px-3 py-3 border-b border-l border-red-600/20 text-center font-medium text-gray-300 min-w-[110px] max-w-[140px]"
                    >
                      <span className="block truncate">{p.title}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BLOCS.map((bloc) => (
                  <Fragment key={bloc.code}>
                    <tr>
                      <th
                        scope="colgroup"
                        colSpan={projects.length + 1}
                        className="sticky left-0 text-left bg-red-600/10 border-y border-red-600/20 px-4 py-2"
                      >
                        <span className="font-mono text-xs font-bold text-red-500">
                          {bloc.code}
                        </span>
                        <span className="ml-3 text-xs text-gray-400 font-normal">
                          {bloc.title}
                        </span>
                      </th>
                    </tr>

                    {bloc.competences.map((competence) => {
                      const isGap = !coveredCodes.has(competence.code);

                      return (
                        <tr
                          key={competence.code}
                          className="hover:bg-white/2 transition-colors"
                        >
                          <th
                            scope="row"
                            className={`sticky left-0 z-10 text-left font-normal px-4 py-2.5 border-b border-red-600/10 ${
                              isGap ? "bg-yellow-950/40" : "bg-gray-900"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  isGap
                                    ? "bg-yellow-400 shadow-[0_0_6px_#facc15]"
                                    : "bg-green-500 shadow-[0_0_6px_#22c55e]"
                                }`}
                              />
                              <span className="font-mono text-xs text-red-500/80 w-10 shrink-0">
                                {competence.code}
                              </span>
                              <span className="text-gray-300 text-xs leading-snug">
                                {competence.label}
                              </span>
                            </div>
                          </th>

                          {projects.map((project) => {
                            const checked = project.competences.some(
                              (c) => c.code === competence.code,
                            );
                            const cellKey = `${project.id}:${competence.code}`;
                            const isSaving = savingCell === cellKey;
                            const dot = (
                              <span
                                className={`w-4 h-4 rounded-full border transition-all ${
                                  checked
                                    ? "bg-red-600 border-red-600 shadow-[0_0_8px_rgba(220,38,38,0.6)]"
                                    : `border-gray-700 ${canEdit ? "hover:border-red-600/60" : ""}`
                                } ${isSaving ? "animate-pulse" : ""}`}
                              />
                            );

                            return (
                              <td
                                key={project.id}
                                className="border-b border-l border-red-600/10 p-0 text-center"
                              >
                                {canEdit ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleCell(project, competence.code)
                                    }
                                    disabled={isSaving}
                                    aria-pressed={checked}
                                    aria-label={`${competence.code} — ${project.title}`}
                                    className="w-full h-full py-2.5 flex items-center justify-center hover:bg-red-600/10 transition-colors disabled:opacity-50"
                                  >
                                    {dot}
                                  </button>
                                ) : (
                                  <div
                                    role="img"
                                    aria-label={`${competence.code} — ${project.title} : ${
                                      checked ? "rattachée" : "non rattachée"
                                    }`}
                                    className="w-full h-full py-2.5 flex items-center justify-center"
                                  >
                                    {dot}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
