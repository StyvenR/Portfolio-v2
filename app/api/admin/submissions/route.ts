import { getTokenFromRequest, verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    // Récupérer les paramètres de requête
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // Construire la requête de recherche
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { message: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    // Récupérer les soumissions
    const [submissions, total] = await Promise.all([
      prisma.contactSubmission.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.contactSubmission.count({ where }),
    ]);

    return NextResponse.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des soumissions:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body as { ids: string[] };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Aucun identifiant fourni" },
        { status: 400 }
      );
    }

    await prisma.contactSubmission.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression des soumissions:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
