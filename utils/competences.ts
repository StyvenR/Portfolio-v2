export type ActiviteCode = "A1" | "A2" | "A3" | "A4" | "A5" | "A6" | "A7";
export type BlocCode = "C1" | "C2" | "C3";

export interface Activite {
  code: ActiviteCode;
  title: string;
  description: string;
}

export interface Competence {
  code: string;
  label: string;
  activite: ActiviteCode;
}

export interface Bloc {
  code: BlocCode;
  /** Numéro de secteur de piste (S1/S2/S3) utilisé par l'UI. */
  sector: 1 | 2 | 3;
  title: string;
  competences: Competence[];
}

export const ACTIVITES: Record<ActiviteCode, Activite> = {
  A1: {
    code: "A1",
    title: "Le cadrage du projet",
    description:
      "Le développeur web conçoit, développe et publie des sites web. Dans son activité de cadrage de projet et de conception de la solution web, il est chargé de recueillir et d'interpréter les informations données par le client désireux de faire créer son produit. Le développeur web effectue un travail de recherche, en amont du projet, afin de déterminer les meilleures réponses aux besoins du client.",
  },
  A2: {
    code: "A2",
    title: "La conception de la solution web",
    description:
      "Le développeur web prépare le cahier des charges, les maquettes et les schémas de conception décrivant les éléments constitutifs fonctionnels et techniques de la solution, en collaboration étroite avec le client.",
  },
  A3: {
    code: "A3",
    title: "La préparation de l'environnement de travail",
    description:
      "Une fois le projet conceptualisé, présenté et accepté par le client, le développeur web prépare l'environnement de travail nécessaire au bon développement de la solution, seul ou en équipe avec d'autres développeurs web, graphistes, chefs de projets, ainsi que tous les prestataires intervenant à tous niveaux du développement de la solution.",
  },
  A4: {
    code: "A4",
    title: "Le développement « front-end »",
    description:
      "Le développeur web « front-end » intègre les différents éléments de la solution web à partir des maquettes des différentes interfaces de la solution avec l'aide de frameworks de programmation « front » tout en respectant les normes d'accessibilité, d'ergonomie et de référencement et les dernières normes des langages utilisés (HTML, CSS, JS, …).",
  },
  A5: {
    code: "A5",
    title: "Le développement « back-end »",
    description:
      "Le développeur web « back-end » crée le prototype de la solution web pour présenter l'architecture technique au client, il rédige ensuite le code de la solution en transcrivant les fonctionnalités du cahier des charges. Il met en place la base de données et développe la logique pour que la solution puisse accéder à chaque entité de celle-ci. Il implémente les règles d'authentification en respectant les bonnes pratiques en matière de sécurité afin de sécuriser l'accès à la solution web.",
  },
  A6: {
    code: "A6",
    title: "L'intégration continue",
    description:
      "Le développeur web met en place un plan de tests en concevant les différents tests unitaires et d'intégration afin de vérifier que l'ensemble des fonctionnalités développées fonctionne comme attendu, séparément et à l'unisson puis il déploie l'application en utilisant un serveur afin de la rendre accessible aux utilisateurs.",
  },
  A7: {
    code: "A7",
    title: "La publication de la solution",
    description:
      "Un développeur web est responsable de la maintenance de sites web. Le développeur rédige une documentation technique pour garantir la pérennité et l'évolution future de la solution web et une documentation utilisateur pour faciliter la prise en main de l'outil par les utilisateurs. Il suit le lancement de la solution web en recueillant les retours utilisateurs pour évaluer la qualité de la solution web déployée. Il identifie les améliorations qualitatives et de performance d'une solution web en analysant les retours utilisateurs et les données d'analyse du trafic pour identifier les axes d'amélioration, et sait rédiger un document argumentatif listant des propositions d'améliorations afin de faire valider des préconisations de développements correctifs d'une solution web.",
  },
};

export const BLOCS: Bloc[] = [
  {
    code: "C1",
    sector: 1,
    title: "Cadrage du projet et conception de la solution web",
    competences: [
      { code: "C1.1", label: "Rédaction du cahier des charges (CDC)", activite: "A1" },
      { code: "C1.2", label: "Rédaction des spécifications techniques", activite: "A2" },
      { code: "C1.3", label: "Déploiement de l'environnement de travail", activite: "A3" },
      { code: "C1.4", label: "Réalisation des maquettes", activite: "A2" },
      { code: "C1.5", label: "Modélisation des fonctionnalités à développer", activite: "A2" },
      { code: "C1.6", label: "Réalisation du support de présentation du projet", activite: "A1" },
    ],
  },
  {
    code: "C2",
    sector: 2,
    title: "Développement d'une solution web",
    competences: [
      { code: "C2.1", label: "Développement du prototype", activite: "A5" },
      { code: "C2.2", label: "Respect des normes d'accessibilité, d'ergonomie et de référencement", activite: "A4" },
      { code: "C2.3", label: "Respect des normes du développement front-end", activite: "A4" },
      { code: "C2.4", label: "Implémentation du back-end", activite: "A5" },
      { code: "C2.5", label: "Implémentation du système d'authentification", activite: "A5" },
      { code: "C2.6", label: "Implémentation du plan de tests", activite: "A6" },
      { code: "C2.7", label: "Déploiement de l'application", activite: "A6" },
    ],
  },
  {
    code: "C3",
    sector: 3,
    title: "Assurance qualité tout au long du cycle de vie",
    competences: [
      { code: "C3.1", label: "Rédaction d'une documentation technique", activite: "A7" },
      { code: "C3.2", label: "Rédaction d'une documentation utilisateur", activite: "A7" },
      { code: "C3.3", label: "Monitoring des retours utilisateurs", activite: "A7" },
      { code: "C3.4", label: "Identification des améliorations de la solution", activite: "A7" },
      { code: "C3.5", label: "Analyse de la performance", activite: "A7" },
      { code: "C3.6", label: "Préconisation de correctifs", activite: "A7" },
    ],
  },
];

export const ALL_COMPETENCES: Competence[] = BLOCS.flatMap((b) => b.competences);

export const COMPETENCES_BY_CODE: Record<string, Competence> = Object.fromEntries(
  ALL_COMPETENCES.map((c) => [c.code, c]),
);

export const TOTAL_COMPETENCES = ALL_COMPETENCES.length;

export function isCompetenceCode(value: unknown): value is string {
  return typeof value === "string" && value in COMPETENCES_BY_CODE;
}

/** Le bloc auquel appartient une compétence, ou undefined si le code est inconnu. */
export function blocOf(code: string): Bloc | undefined {
  return BLOCS.find((b) => b.competences.some((c) => c.code === code));
}
