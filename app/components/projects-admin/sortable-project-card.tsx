"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ExternalLink, GitBranch, GripVertical, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { PLACEHOLDER_IMAGE } from "@/utils/my_project";
import type { AdminProject } from "./types";

interface SortableProjectCardProps {
  project: AdminProject;
  index: number;
  /** `false` : carte consultable, sans poignée de tri ni actions. */
  canEdit?: boolean;
  onEdit: (project: AdminProject) => void;
  onDelete: (project: AdminProject) => void;
}

export function SortableProjectCard({
  project,
  index,
  canEdit = true,
  onEdit,
  onDelete,
}: SortableProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id, disabled: !canEdit });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-stretch gap-4 p-4 rounded-lg border bg-gray-900/80 backdrop-blur-sm transition-shadow ${
        isDragging
          ? "border-red-600 shadow-lg shadow-red-600/20 z-10 opacity-90"
          : "border-red-600/20 hover:border-red-600/40"
      }`}
    >
      {canEdit && (
        <button
          type="button"
          className="flex items-center justify-center px-1 text-gray-500 hover:text-red-500 cursor-grab active:cursor-grabbing touch-none"
          aria-label="Glisser pour réordonner"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5" />
        </button>
      )}

      <div className="flex items-center justify-center w-8 text-sm font-mono text-red-500/80 shrink-0">
        {String(index + 1).padStart(2, "0")}
      </div>

      <div className="relative w-20 h-20 rounded-md overflow-hidden bg-gray-800 border border-red-600/10 shrink-0">
        <Image
          src={project.image || PLACEHOLDER_IMAGE}
          alt={project.title}
          fill
          className="object-cover"
          sizes="80px"
          unoptimized
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold truncate">{project.title}</h3>
          <span
            title={`${project.competences.length} compétence(s) rattachée(s)`}
            className={`shrink-0 px-2 py-0.5 rounded-full font-mono text-[10px] ${
              project.competences.length > 0
                ? "bg-green-600/15 text-green-400"
                : "bg-yellow-400/10 text-yellow-500"
            }`}
          >
            {project.competences.length} CMP
          </span>
        </div>
        <p className="text-sm text-gray-400 line-clamp-2 mt-0.5">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {project.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-red-600/10 text-red-300 text-xs"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 5 && (
            <span className="px-2 py-0.5 text-xs text-gray-500">
              +{project.tags.length - 5}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end justify-between shrink-0 gap-2">
        <div className="flex items-center gap-1 text-gray-500">
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              title="Lien live"
              className="p-1.5 rounded-md hover:text-red-500 hover:bg-red-600/10 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
              className="p-1.5 rounded-md hover:text-red-500 hover:bg-red-600/10 transition-colors"
            >
              <GitBranch className="w-4 h-4" />
            </a>
          )}
        </div>
        {canEdit && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(project)}
              className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Éditer"
              title="Éditer"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(project)}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-600/10 transition-colors"
              aria-label="Supprimer"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
