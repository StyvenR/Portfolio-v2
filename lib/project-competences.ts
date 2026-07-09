import { isCompetenceCode } from "@/utils/competences";

export interface CompetenceInput {
  code: string;
  evidence: string | null;
}

export class InvalidCompetenceError extends Error {}

/**
 * Valide une liste de liens compétence venant du client. Les codes inconnus du
 * référentiel sont rejetés plutôt qu'ignorés : un code fantôme en base
 * n'apparaîtrait nulle part dans l'UI et passerait inaperçu.
 */
export function parseCompetencesInput(raw: unknown): CompetenceInput[] {
  if (!Array.isArray(raw)) {
    throw new InvalidCompetenceError("`competences` doit être un tableau.");
  }

  const seen = new Set<string>();
  return raw.map((entry) => {
    const code = (entry as { code?: unknown })?.code;
    if (!isCompetenceCode(code)) {
      throw new InvalidCompetenceError(`Compétence inconnue : ${String(code)}`);
    }
    if (seen.has(code)) {
      throw new InvalidCompetenceError(`Compétence en double : ${code}`);
    }
    seen.add(code);

    const rawEvidence = (entry as { evidence?: unknown }).evidence;
    const evidence =
      typeof rawEvidence === "string" && rawEvidence.trim()
        ? rawEvidence.trim()
        : null;

    return { code, evidence };
  });
}
