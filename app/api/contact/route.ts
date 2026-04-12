import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    // Sauvegarder la soumission
    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        message,
      },
    });

    return NextResponse.json(
      { message: "Message envoyé avec succès", id: submission.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la soumission du formulaire:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
