import { getTokenFromRequest, verifyToken } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      user: payload,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
