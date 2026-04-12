import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import pkg from "pg";
import { projects as fallbackProjects } from "../utils/my_project";

config();

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";

  if (!email || !password) {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD manquants, skip admin seed.");
    return;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log(`L'utilisateur ${email} existe déjà.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, role: "admin" },
  });

  console.log(`Utilisateur admin créé: ${user.email}`);
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
  await seedAdmin();
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
