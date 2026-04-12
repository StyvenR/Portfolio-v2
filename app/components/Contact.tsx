"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Message envoyé avec succès !",
        });
        setFormData({ name: "", email: "", message: "" });
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || "Erreur lors de l'envoi du message",
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Erreur de connexion. Veuillez réessayer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-16 md:py-32 px-4 md:px-6 relative overflow-hidden bg-black"
    >
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
            <span className="text-red-600">CONTACT</span>
          </h2>
          <p className="text-base md:text-xl text-gray-400">
            Prêt à démarrer votre projet ? Contactez-moi
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Informations de contact */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-2xl font-bold text-red-600 mb-6">
                Informations
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Email</p>
                    <p className="text-white">styven.raya@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Téléphone</p>
                    <p className="text-white">+33 7 69 19 06 95</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Localisation</p>
                    <p className="text-white">Paris, France</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Formulaire de contact */}
          <motion.form
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Nom
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-colors"
                placeholder="Votre nom"
              />
            </div>
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
                name="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-colors"
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-colors resize-none"
                placeholder="Votre message..."
              />
            </div>
            {submitStatus.type && (
              <div
                className={`p-4 rounded-lg ${
                  submitStatus.type === "success"
                    ? "bg-green-600/20 text-green-400 border border-green-600/30"
                    : "bg-red-600/20 text-red-400 border border-red-600/30"
                }`}
              >
                {submitStatus.message}
              </div>
            )}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
              className="w-full px-8 py-4 bg-red-600 text-white font-bold text-lg tracking-wider hover:bg-red-700 transition-colors border-2 border-red-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "ENVOI EN COURS..." : "ENVOYER"}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
