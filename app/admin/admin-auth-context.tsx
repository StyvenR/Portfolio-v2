"use client";

import { canEditContent } from "@/lib/roles";
import { createContext, useContext, useMemo } from "react";

export interface AdminUser {
  userId: string;
  email: string;
  role: string;
}

interface AdminAuthValue {
  user: AdminUser | null;
  /** `false` pour les rôles en lecture seule (visitor_admin). */
  canEdit: boolean;
}

const AdminAuthContext = createContext<AdminAuthValue>({
  user: null,
  canEdit: false,
});

export function AdminAuthProvider({
  user,
  children,
}: {
  user: AdminUser | null;
  children: React.ReactNode;
}) {
  const value = useMemo<AdminAuthValue>(
    () => ({ user, canEdit: canEditContent(user?.role) }),
    [user],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
