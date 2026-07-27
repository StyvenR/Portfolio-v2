import { requireWriteAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface ReorderBody {
  ids?: string[];
}

export async function PATCH(request: NextRequest) {
  const denied = requireWriteAccess(request);
  if (denied) return denied;

  try {
    const { ids } = (await request.json()) as ReorderBody;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Liste d'identifiants invalide" },
        { status: 400 },
      );
    }

    const offset = ids.length + 1000;
    await prisma.$transaction([
      ...ids.map((id, index) =>
        prisma.project.update({
          where: { id },
          data: { order: index + offset },
        }),
      ),
      ...ids.map((id, index) =>
        prisma.project.update({
          where: { id },
          data: { order: index },
        }),
      ),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /admin/projects/reorder:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
