"use client";

import { ProjectFormDialog } from "@/app/components/projects-admin/project-form-dialog";
import { ProjectsSortableList } from "@/app/components/projects-admin/projects-sortable-list";
import type {
  AdminProject,
  ProjectFormValues,
} from "@/app/components/projects-admin/types";
import { Home, ListChecks, LogOut, MessageSquare, Plus } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function AdminProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProject | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminProject | null>(null);

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
    const token = getToken();
    if (!token) return;
    fetch("/api/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => d.user && setUser(d.user))
      .catch(() => undefined);
  }, [getToken]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleReorder = async (reordered: AdminProject[]) => {
    const previous = projects;
    setProjects(reordered);
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch("/api/admin/projects/reorder", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: reordered.map((p) => p.id) }),
      });
      if (!res.ok) throw new Error("reorder failed");
    } catch (err) {
      console.error(err);
      setProjects(previous);
    }
  };

  const handleSubmit = async (values: ProjectFormValues) => {
    const token = getToken();
    if (!token) return;

    setIsSaving(true);
    try {
      const url = editing
        ? `/api/admin/projects/${editing.id}`
        : "/api/admin/projects";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          image: values.image,
          tags: values.tags,
          link: values.link || null,
          github: values.github || null,
          competences: values.competences,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur" }));
        throw new Error(err.error ?? "Erreur lors de l'enregistrement");
      }

      setDialogOpen(false);
      setEditing(null);
      await fetchProjects();
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/projects/${pendingDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("delete failed");
      setProjects((p) => p.filter((x) => x.id !== pendingDelete.id));
    } catch (err) {
      console.error(err);
    } finally {
      setPendingDelete(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-red-600/20 bg-black/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="text-red-600">ADMIN</span>{" "}
              <span className="text-white">PROJETS</span>
            </h1>
            <p className="text-sm text-gray-400">
              {user?.email || "Chargement..."}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/competences"
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg transition-colors"
            >
              <ListChecks className="w-4 h-4" />
              <span className="text-white">Compétences</span>
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

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              {projects.length} projet{projects.length > 1 ? "s" : ""}
            </h2>
            <p className="text-sm text-gray-400">
              Glissez verticalement pour changer l&apos;ordre d&apos;affichage.
            </p>
          </div>
          <motion.button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouveau projet
          </motion.button>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Chargement...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-red-600/20 rounded-lg">
            <p className="text-gray-400 mb-4">Aucun projet pour le moment.</p>
            <button
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              Créer le premier projet
            </button>
          </div>
        ) : (
          <ProjectsSortableList
            projects={projects}
            onReorder={handleReorder}
            onEdit={(p) => {
              setEditing(p);
              setDialogOpen(true);
            }}
            onDelete={setPendingDelete}
          />
        )}
      </div>

      <ProjectFormDialog
        open={dialogOpen}
        project={editing}
        isSaving={isSaving}
        onClose={() => {
          if (isSaving) return;
          setDialogOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPendingDelete(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-gray-950 border border-red-600/30 rounded-xl shadow-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-2">
              Supprimer ce projet ?
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              «&nbsp;{pendingDelete.title}&nbsp;» sera supprimé définitivement.
              Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPendingDelete(null)}
                className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
