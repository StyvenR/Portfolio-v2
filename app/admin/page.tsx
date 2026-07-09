"use client";

import { SubmissionsDataTable } from "@/app/components/submissions-data-table";
import { FolderKanban, Home, ListChecks, LogOut, Search } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Récupérer les informations de l'utilisateur depuis le token
    const token = localStorage.getItem("auth_token");
    if (token) {
      fetch("/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
          }
        })
        .catch(() => {
          localStorage.removeItem("auth_token");
          router.push("/admin/login");
        });
    }
  }, [router]);

  const fetchSubmissions = useCallback(
    async (page: number = 1, searchTerm: string = "") => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          router.push("/admin/login");
          return;
        }

        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          ...(searchTerm && { search: searchTerm }),
        });

        const response = await fetch(`/api/admin/submissions?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("auth_token");
          router.push("/admin/login");
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setSubmissions(data.submissions);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des soumissions:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    fetchSubmissions(currentPage, search);
  }, [currentPage, search, fetchSubmissions]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.push("/admin/login");
  };

  const handleDeleteSubmissions = async (ids: string[]) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const response = await fetch("/api/admin/submissions", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression");
    }

    await fetchSubmissions(currentPage, search);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-red-600/20 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="text-red-600">ADMIN</span>{" "}
              <span className="text-white">DASHBOARD</span>
            </h1>
            <p className="text-sm text-gray-400">
              {user?.email || "Chargement..."}
            </p>
          </div>
          <div className="flex justify-between gap-3">
            <div>
              <Link
                href="/admin/projects"
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg transition-colors"
              >
                <FolderKanban className="w-4 h-4" />
                <span className="text-white">Projets</span>
              </Link>
            </div>
            <div>
              <Link
                href="/admin/competences"
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg transition-colors"
              >
                <ListChecks className="w-4 h-4" />
                <span className="text-white">Compétences</span>
              </Link>
            </div>
            <div>
              <motion.button
                onClick={() => router.push("/")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="text-white">Retour</span>
              </motion.button>
            </div>
            <div>
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
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Rechercher par nom, email ou message..."
              className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-colors"
            />
          </div>
        </div>

        {/* Submissions DataTable */}
        {submissions.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              {search ? "Aucun résultat trouvé" : "Aucune soumission"}
            </p>
          </div>
        ) : (
          <SubmissionsDataTable
            data={submissions}
            isLoading={isLoading}
            onDelete={handleDeleteSubmissions}
          />
        )}
      </div>
    </div>
  );
}
