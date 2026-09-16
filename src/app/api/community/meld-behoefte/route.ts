import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { meldBehoefteBijDrempel } from "@/lib/demand";

/**
 * Dunne HTTP-wrapper rond meldBehoefteBijDrempel — zelfde rol als
 * /api/community/meld-drempel: een aanroepbaar eindpunt, consistent met
 * dat patroon. /api/boekingen roept de gedeelde functie in dit geval
 * rechtstreeks aan (zelfde server-context, geen self-HTTP-call nodig).
 */
export async function POST(request: Request) {
  const { clusterId, categoryId } = await request.json();
  if (!clusterId || !categoryId) {
    return NextResponse.json({ error: "clusterId en categoryId zijn verplicht" }, { status: 400 });
  }

  const admin = createAdminSupabase();
  const resultaat = await meldBehoefteBijDrempel(admin, { clusterId, categoryId });
  return NextResponse.json(resultaat);
}
