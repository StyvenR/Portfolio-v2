import { siteUrl } from "@/lib/site";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/assets/icon.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/assets/icon.png", type: "image/png", sizes: "512x512" }],
    shortcut: ["/assets/icon.png"],
  },
  title: {
    default: "Styven Raya — Développeur Web Next.js & TypeScript",
    template: "%s | Styven Raya",
  },
  description:
    "Portfolio de Styven Raya, développeur web spécialisé en Next.js, React et TypeScript. Découvrez mes projets, mon parcours et contactez-moi pour collaborer.",
  keywords: [
    "Styven Raya",
    "développeur web",
    "développeur front-end",
    "Next.js",
    "React",
    "TypeScript",
    "portfolio",
    "Paris",
    "alternance",
    "freelance",
  ],
  authors: [{ name: "Styven Raya", url: siteUrl }],
  creator: "Styven Raya",
  publisher: "Styven Raya",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "Styven Raya — Portfolio",
    title: "Styven Raya — Développeur Web Next.js & TypeScript",
    description:
      "Portfolio de Styven Raya, développeur web spécialisé en Next.js, React et TypeScript.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Styven Raya — Développeur Web",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Styven Raya — Développeur Web Next.js & TypeScript",
    description:
      "Portfolio de Styven Raya, développeur web spécialisé en Next.js, React et TypeScript.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#dc2626",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Styven Raya",
    url: siteUrl,
    jobTitle: "Développeur Web",
    description:
      "Développeur web spécialisé en Next.js, React et TypeScript, basé à Paris.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Paris",
      addressCountry: "FR",
    },
    email: "mailto:styven.raya@gmail.com",
    sameAs: [
      "https://www.linkedin.com/in/styven-raya-ab5312302/",
      "https://github.com/StyvenR",
    ],
    knowsAbout: [
      "Next.js",
      "React",
      "TypeScript",
      "JavaScript",
      "Node.js",
      "Tailwind CSS",
      "PostgreSQL",
      "Prisma",
    ],
  };

  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="preconnect"
          href="https://cdn.simpleicons.org"
          crossOrigin=""
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <a
          href="#hero"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:bg-red-600 focus:text-white focus:px-4 focus:py-2 focus:rounded"
        >
          Aller au contenu principal
        </a>
        {children}
      </body>
    </html>
  );
}
