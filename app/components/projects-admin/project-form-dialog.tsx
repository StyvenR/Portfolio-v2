"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import type { AdminProject, ProjectFormValues } from "./types";

interface ProjectFormDialogProps {
  open: boolean;
  project: AdminProject | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
}

const INPUT_CLASS =
  "w-full px-3 py-2.5 bg-gray-900 border border-red-600/20 rounded-lg text-white placeholder-gray-500 outline-none transition-colors focus:border-red-600 focus:ring-2 focus:ring-red-600/20";

const EMPTY_VALUES: ProjectFormValues = {
  title: "",
  description: "",
  image: "",
  tags: [],
  link: "",
  github: "",
};

function initialFormValues(project: AdminProject | null): ProjectFormValues {
  if (!project) return EMPTY_VALUES;
  return {
    title: project.title,
    description: project.description,
    image: project.image ?? "",
    tags: [...project.tags],
    link: project.link ?? "",
    github: project.github ?? "",
  };
}

export function ProjectFormDialog({
  open,
  project,
  isSaving,
  onClose,
  onSubmit,
}: ProjectFormDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start md:items-center justify-center overflow-y-auto p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-gray-950 border border-red-600/30 rounded-xl shadow-2xl my-8"
          >
            <ProjectFormFields
              key={project?.id ?? "new"}
              project={project}
              isSaving={isSaving}
              onClose={onClose}
              onSubmit={onSubmit}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProjectFormFields({
  project,
  isSaving,
  onClose,
  onSubmit,
}: Omit<ProjectFormDialogProps, "open">) {
  const [values, setValues] = useState<ProjectFormValues>(() =>
    initialFormValues(project),
  );
  const [tagDraft, setTagDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const addTag = () => {
    const value = tagDraft.trim();
    if (!value || values.tags.includes(value)) {
      setTagDraft("");
      return;
    }
    setValues((v) => ({ ...v, tags: [...v.tags, value] }));
    setTagDraft("");
  };

  const removeTag = (tag: string) => {
    setValues((v) => ({ ...v, tags: v.tags.filter((t) => t !== tag) }));
  };

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag();
    } else if (
      event.key === "Backspace" &&
      tagDraft === "" &&
      values.tags.length > 0
    ) {
      setValues((v) => ({ ...v, tags: v.tags.slice(0, -1) }));
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!values.title.trim() || !values.description.trim()) {
      setError("Titre et description sont obligatoires.");
      return;
    }

    try {
      await onSubmit({
        ...values,
        title: values.title.trim(),
        description: values.description.trim(),
        image: values.image.trim(),
        link: values.link.trim(),
        github: values.github.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await handleImageUpload(file);
    event.target.value = "";
  };

  const handleImageUpload = async (file: File) => {
    setError(null);

    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Session expirée. Reconnecte-toi.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/projects/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || typeof data.url !== "string") {
        throw new Error(data.error ?? "Échec de l'upload de l'image.");
      }

      setValues((current) => ({ ...current, image: data.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 border-b border-red-600/20">
        <h2 className="text-xl font-bold text-white">
          {project ? "Éditer le projet" : "Nouveau projet"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              <Field label="Titre" required>
                <input
                  type="text"
                  value={values.title}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, title: e.target.value }))
                  }
                  className={INPUT_CLASS}
                  placeholder="PokeFlow"
                  required
                />
              </Field>

              <Field label="Description" required>
                <textarea
                  value={values.description}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, description: e.target.value }))
                  }
                  className={`${INPUT_CLASS} min-h-[92px] resize-y`}
                  placeholder="Site d'e-commerce…"
                  required
                />
              </Field>

              <Field label="Image" hint="Fichier recommandé">
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    disabled={isUploadingImage || isSaving}
                    className={`${INPUT_CLASS} file:mr-3 file:rounded-md file:border-0 file:bg-red-600 file:px-3 file:py-2 file:text-white file:cursor-pointer hover:file:bg-red-700 disabled:opacity-60`}
                  />

                  {isUploadingImage && (
                    <p className="inline-flex items-center gap-2 text-sm text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Upload en cours...
                    </p>
                  )}

                  <details className="rounded-md border border-red-600/20 bg-gray-900/40 px-3 py-2">
                    <summary className="cursor-pointer text-sm text-gray-300">
                      Ou coller une URL manuelle
                    </summary>
                    <div className="pt-2">
                      <input
                        type="text"
                        value={values.image}
                        onChange={(e) =>
                          setValues((v) => ({ ...v, image: e.target.value }))
                        }
                        className={INPUT_CLASS}
                        placeholder="https://... ou URL Blob"
                      />
                    </div>
                  </details>

                  <div className="relative w-20 h-20 rounded-md border border-red-600/20 overflow-hidden bg-gray-900 shrink-0 flex items-center justify-center">
                    {values.image ? (
                      <Image
                        src={values.image}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                </div>
              </Field>

              <Field label="Tags" hint="Entrée ou virgule pour ajouter">
                <div className="flex flex-wrap gap-2 p-2 rounded-md bg-gray-900 border border-red-600/20 focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-600/20 transition-colors">
                  {values.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600/15 text-red-300 text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-100"
                        aria-label={`Retirer ${tag}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagDraft}
                    onChange={(e) => setTagDraft(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={addTag}
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-white placeholder-gray-500"
                    placeholder={values.tags.length === 0 ? "React, Tailwind…" : ""}
                  />
                </div>
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Lien live (optionnel)">
                  <input
                    type="url"
                    value={values.link}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, link: e.target.value }))
                    }
                    className={INPUT_CLASS}
                    placeholder="https://…"
                  />
                </Field>
                <Field label="GitHub (optionnel)">
                  <input
                    type="url"
                    value={values.github}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, github: e.target.value }))
                    }
                    className={INPUT_CLASS}
                    placeholder="https://github.com/…"
                  />
                </Field>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-600/10 border border-red-600/30 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2 border-t border-red-600/10">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {project ? "Enregistrer" : "Créer"}
                </button>
              </div>
      </form>
    </>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-gray-200">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
        {hint && <span className="text-xs text-gray-500">{hint}</span>}
      </div>
      {children}
    </label>
  );
}
