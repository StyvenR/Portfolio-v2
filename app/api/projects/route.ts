import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Erreur lors de la récupération des projets:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
