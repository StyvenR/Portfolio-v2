import type { Metadata } from "next";
import HomeClient from "./components/HomeClient";

export const metadata: Metadata = {
  title: "Accueil",
  description:
    "Styven Raya, développeur web Next.js & TypeScript basé à Paris. Découvrez mes projets, mon parcours et contactez-moi.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <HomeClient />;
}
