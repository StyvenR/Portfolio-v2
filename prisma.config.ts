import { config } from "dotenv";

// Charger les variables d'environnement depuis .env
config();

const prismaConfig = {
  datasource: {
    url: process.env.DATABASE_URL,
  },
};

export default prismaConfig;
