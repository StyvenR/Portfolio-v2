import { getAuthPayload, requireWriteAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  InvalidCompetenceError,
  parseCompetencesInput,
} from "@/lib/project-competences";
import { NextRequest, NextResponse } from "next/server";

const COMPETENCES_INCLUDE = {
  competences: {
    select: { code: true, evidence: true },
    orderBy: { code: "asc" },
  },
} as const;

export async function GET(request: NextRequest) {
  if (!getAuthPayload(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const projects = await prisma.project.findMany({
      orderBy: { order: "asc" },
      include: COMPETENCES_INCLUDE,
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
  competences?: unknown;
}

export async function POST(request: NextRequest) {
  const denied = requireWriteAccess(request);
  if (denied) return denied;

  try {
    const body = (await request.json()) as CreateProjectBody;
    const { title, description, image, tags, link, github } = body;

    if (!title || !description || !Array.isArray(tags)) {
      return NextResponse.json(
        { error: "Champs requis manquants" },
        { status: 400 },
      );
    }

    const competences =
      body.competences === undefined
        ? []
        : parseCompetencesInput(body.competences);

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
        competences: { create: competences },
      },
      include: COMPETENCES_INCLUDE,
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof InvalidCompetenceError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("POST /admin/projects:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
