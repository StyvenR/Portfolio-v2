"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Mail, Trash2, User, X } from "lucide-react";
import { useEffect } from "react";
import type { ContactSubmission } from "./index";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface SubmissionDetailDialogProps {
  submission: ContactSubmission | null;
  isDeleting?: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const SubmissionDetailDialog = ({
  submission,
  isDeleting,
  onClose,
  onDelete,
}: SubmissionDetailDialogProps) => {
  useEffect(() => {
    if (!submission) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [submission, onClose]);

  return (
    <AnimatePresence>
      {submission && (
        <motion.div
          key="detail-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="submission-detail-title"
            className="relative w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden rounded-xl border border-red-600/50 bg-neutral-950 shadow-2xl shadow-red-950/30"
          >
            <div className="flex items-start justify-between gap-4 p-6 border-b border-neutral-800">
              <div>
                <h2
                  id="submission-detail-title"
                  className="text-lg font-semibold text-white"
                >
                  Détail du message
                </h2>
                <p className="text-sm text-neutral-300 mt-1">
                  Informations complètes de la soumission
                </p>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailField
                  icon={<User className="w-4 h-4 text-red-500" />}
                  label="Nom"
                  value={submission.name}
                />
                <DetailField
                  icon={<Calendar className="w-4 h-4 text-red-500" />}
                  label="Date"
                  value={formatDate(submission.createdAt)}
                />
                <div className="sm:col-span-2">
                  <DetailField
                    icon={<Mail className="w-4 h-4 text-red-500" />}
                    label="Email"
                    value={
                      <a
                        href={`mailto:${submission.email}`}
                        className="text-red-400 hover:text-red-300 hover:underline lowercase"
                      >
                        {submission.email}
                      </a>
                    }
                  />
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider font-semibold text-neutral-300 mb-2">
                  Message
                </div>
                <div className="rounded-lg border border-neutral-700 bg-neutral-900 p-4 text-neutral-50 whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">
                  {submission.message}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-neutral-800 bg-neutral-900">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-white border border-neutral-700 hover:bg-neutral-800 hover:border-neutral-600 transition-colors text-sm font-medium"
              >
                Fermer
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(submission.id)}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? "Suppression..." : "Supprimer"}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DetailField = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <div>
    <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-neutral-300 mb-1.5">
      {icon}
      <span>{label}</span>
    </div>
    <div className="text-white text-sm wrap-break-word">{value}</div>
  </div>
);
