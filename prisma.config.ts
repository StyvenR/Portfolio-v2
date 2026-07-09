import { config } from "dotenv";

// Même précédence que Next.js : `.env.local` gagne sur `.env`. Sans ça le CLI
// Prisma ne lirait que `.env` et les migrations partiraient sur une autre base
// que celle utilisée par `next dev`.
config({ path: [".env.local", ".env"] });

const prismaConfig = {
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
};

export default prismaConfig;
