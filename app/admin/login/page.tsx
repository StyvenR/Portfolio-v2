"use client";

import { Home } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Email ou mot de passe incorrect");
        return;
      }

      // Stocker le token dans localStorage
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
        router.push("/admin");
        router.refresh();
      }
    } catch (error) {
      setError("Une erreur est survenue");
      console.error("Erreur lors de la connexion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      {/* Bouton Home */}
      <motion.button
        onClick={() => router.push("/")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-6 right-6 z-20 flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors"
      >
        <Home className="w-4 h-4" />
        Home
      </motion.button>
      {/* Speed lines effect */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 10 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute h-full w-[2px]"
            style={{
              left: `${i * 10}%`,
              background:
                "linear-gradient(to bottom, transparent, rgba(220, 38, 38, 0.2), transparent)",
            }}
            initial={{ y: -100, opacity: 0 }}
            animate={{
              y: [0, -100],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="bg-black/90 backdrop-blur-sm border-2 border-red-600/30 rounded-lg p-8 shadow-2xl shadow-red-600/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-2">
              <span className="text-red-600">ADMIN</span>
            </h1>
            <p className="text-gray-400">Accès réservé</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-colors"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full px-8 py-4 bg-red-600 text-white font-bold text-lg tracking-wider hover:bg-red-700 transition-colors border-2 border-red-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "CONNEXION..." : "SE CONNECTER"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
