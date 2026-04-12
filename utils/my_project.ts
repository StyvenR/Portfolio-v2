export const PLACEHOLDER_IMAGE = "/assets/placeholder.jpg";

export interface Project {
  id: string | number;
  title: string;
  description: string;
  image: string;
  tags: string[];
  link?: string | null;
  github?: string | null;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "PokeFlow",
    description: "Site d'e-commerce de vente de cartes Pokémon.",
    image: "/assets/pokeflow.png",
    tags: [
      "React",
      "Symfony",
      "NeonDB",
      "Intégration Stripe",
      "Tailwind",
      "API",
    ],
    link: "https://pokeflow-uyz3.vercel.app/",
    github: "https://github.com/StyvenR/PokeFlow",
  },
  {
    id: 2,
    title: "MySpotify",
    description: "Parcours de musique personnalisé en fonction de vos goûts.",
    image: "/assets/my-spotify.png",
    tags: ["React", "Docker", "Express", "Tailwind", "API"],
    link: "blank",
    github: "https://github.com/StyvenR/MySpotify",
  },
  {
    id: 3,
    title: "MySnapchat",
    description: "Application de messagerie instantanée similaire à Snapchat.",
    image: "/assets/my-snapchat.png",
    tags: ["React Native", "Expo", "Tailwind", "API"],
    link: "blank",
    github: "https://github.com/StyvenR/Snapchat-Styven",
  },
  {
    id: 4,
    title: "Free Ads",
    description: "Site d'annonce de vente de produits.",
    image: "/assets/free-ads.png",
    tags: ["Laravel", "Blade", "Tailwind"],
    link: "blank",
    github: "https://github.com/StyvenR/Free-Ads",
  },
  {
    id: 5,
    title: "H5AI",
    description:
      "Description détaillée du projet 5. Ce projet fait partie de mon portfolio et représente une réalisation importante dans le domaine du design et du développement.",
    image: "/assets/h5ai.png",
    tags: ["JavaScript", "CSS", "Express", "Pug"],
    link: "blank",
    github: "https://github.com/StyvenR/H5AI",
  },
];
