"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Ne pas vérifier l'authentification sur la page de login
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Si on est sur la page de login, on ne vérifie pas l'authentification
    if (isLoginPage) {
      setIsLoading(false);
      setIsAuthenticated(true); // Permet d'afficher la page de login
      return;
    }

    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        router.push("/admin/login");
        return;
      }

      try {
        const response = await fetch("/api/auth/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("auth_token");
          router.push("/admin/login");
        }
      } catch (error) {
        localStorage.removeItem("auth_token");
        router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, isLoginPage]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
