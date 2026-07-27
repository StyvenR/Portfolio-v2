import { Eye } from "lucide-react";

/** Indique visuellement qu'un rôle n'a pas les droits de modification. */
export function ReadOnlyBadge() {
  return (
    <span
      title="Votre compte est en lecture seule : aucune modification n'est possible."
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-yellow-400/40 bg-yellow-400/10 text-yellow-400 font-mono text-[10px] tracking-widest"
    >
      <Eye className="w-3 h-3" />
      LECTURE SEULE
    </span>
  );
}
