import { getTokenFromRequest, verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function requireAuth(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const projects = await prisma.project.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("GET /admin/projects:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

interface CreateProjectBody {
  title?: string;
  description?: string;
  image?: string;
  tags?: string[];
  link?: string | null;
  github?: string | null;
}

export async function POST(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as CreateProjectBody;
    const { title, description, image, tags, link, github } = body;

    if (!title || !description || !Array.isArray(tags)) {
      return NextResponse.json(
        { error: "Champs requis manquants" },
        { status: 400 },
      );
    }

    const last = await prisma.project.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const nextOrder = (last?.order ?? -1) + 1;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        image: image?.trim() || null,
        tags,
        link: link || null,
        github: github || null,
        order: nextOrder,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("POST /admin/projects:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
