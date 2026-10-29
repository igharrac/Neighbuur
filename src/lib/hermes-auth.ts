import { NextResponse } from "next/server";

/**
 * Enige, gedeelde check voor alle /api/hermes/*-routes. Hermes krijgt
 * nooit de service-role-key zelf — alleen dit ene gedeelde geheim, dat
 * verder niets anders kan dan deze specifieke, doelgerichte endpoints
 * aanroepen. Zie plan: eerste echte non-human-auth-patroon in dit project.
 */
export function verifyHermesAuth(request: Request): NextResponse | null {
  const expected = process.env.HERMES_API_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "HERMES_API_SECRET is niet geconfigureerd" }, { status: 500 });
  }

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token || token !== expected) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  return null;
}
