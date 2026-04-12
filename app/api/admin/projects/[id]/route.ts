import { getTokenFromRequest, verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function requireAuth(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

interface UpdateBody {
  title?: string;
  description?: string;
  image?: string;
  tags?: string[];
  link?: string | null;
  github?: string | null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as UpdateBody;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.image !== undefined && { image: body.image?.trim() || null }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.link !== undefined && { link: body.link || null }),
        ...(body.github !== undefined && { github: body.github || null }),
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("PATCH /admin/projects/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /admin/projects/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
