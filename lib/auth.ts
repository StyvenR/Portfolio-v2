import { NextResponse } from "next/server";
import { getTokenFromRequest, verifyToken, type JWTPayload } from "./jwt";
import { canEditContent } from "./roles";

/** Payload du token si la requête est authentifiée, sinon `null`. */
export function getAuthPayload(request: Request): JWTPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Garde pour les routes qui modifient des données.
 * Renvoie une réponse d'erreur à retourner tel quel, ou `null` si l'accès est
 * autorisé — les rôles en lecture seule (visitor_admin) reçoivent un 403.
 */
export function requireWriteAccess(request: Request): NextResponse | null {
  const payload = getAuthPayload(request);

  if (!payload) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (!canEditContent(payload.role)) {
    return NextResponse.json(
      { error: "Accès en lecture seule : modification interdite" },
      { status: 403 },
    );
  }

  return null;
}
