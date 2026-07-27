import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import pkg from "pg";
import { ROLE_ADMIN, ROLE_VISITOR_ADMIN } from "../lib/roles";
import { projects as fallbackProjects } from "../utils/my_project";

// Même précédence que Next.js et prisma.config.ts : `.env.local` gagne sur `.env`.
config({ path: [".env.local", ".env"] });

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});

async function seedUser(
  role: string,
  emailVar: string,
  passwordVar: string,
  { optional = false }: { optional?: boolean } = {},
) {
  const email = process.env[emailVar] ?? "";
  const password = process.env[passwordVar] ?? "";

  if (!email || !password) {
    if (!optional) {
      console.log(`${emailVar} / ${passwordVar} manquants, skip ${role} seed.`);
    }
    return;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log(`L'utilisateur ${email} existe déjà.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, role },
  });

  console.log(`Utilisateur ${role} créé: ${user.email}`);
}

async function seedProjects() {
  const count = await prisma.project.count();
  if (count > 0) {
    console.log(`Projects déjà présents (${count}), skip seed.`);
    return;
  }

  await prisma.$transaction(
    fallbackProjects.map((p, index) =>
      prisma.project.create({
        data: {
          title: p.title,
          description: p.description,
          image: p.image,
          tags: p.tags,
          link: p.link && p.link !== "blank" ? p.link : null,
          github: p.github ?? null,
          order: index,
        },
      }),
    ),
  );

  console.log(`${fallbackProjects.length} projets importés.`);
}

async function main() {
  await seedUser(ROLE_ADMIN, "ADMIN_EMAIL", "ADMIN_PASSWORD");
  // Compte de démo en lecture seule : accède à /admin sans rien pouvoir modifier.
  await seedUser(
    ROLE_VISITOR_ADMIN,
    "VISITOR_ADMIN_EMAIL",
    "VISITOR_ADMIN_PASSWORD",
    { optional: true },
  );
  await seedProjects();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
