/**
 * Rôles utilisateurs. Ce fichier ne dépend d'aucune lib serveur : il est
 * importable côté client comme côté route handler.
 */
export const ROLE_ADMIN = "admin";
export const ROLE_VISITOR_ADMIN = "visitor_admin";

/** Rôles qui accèdent à l'admin mais ne peuvent rien modifier. */
const READ_ONLY_ROLES: readonly string[] = [ROLE_VISITOR_ADMIN];

export function isReadOnlyRole(role?: string | null): boolean {
  return !!role && READ_ONLY_ROLES.includes(role);
}

/** Un utilisateur authentifié dont le rôle n'est pas en lecture seule. */
export function canEditContent(role?: string | null): boolean {
  return !!role && !isReadOnlyRole(role);
}
