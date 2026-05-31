import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In docker-compose: BACKEND_URL=http://edgeai-backend:8000
// In local dev (next dev outside compose): falls back to localhost
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  let body: { device?: string; model?: string; lang?: "fr" | "en" } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const device = typeof body.device === "string" ? body.device.trim().slice(0, 80) : "";
  const model = typeof body.model === "string" ? body.model.trim().slice(0, 120) : "";
  const lang: "fr" | "en" = body.lang === "en" ? "en" : "fr";

  if (!device || !model) {
    return NextResponse.json(
      { error: lang === "fr" ? "Selectionnez une cible hardware et un modele." : "Select a hardware target and a model." },
      { status: 400 }
    );
  }

  try {
    const r = await fetch(`${BACKEND_URL}/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device, model_name: model, lang }),
      cache: "no-store",
    });
    const j = await r.json();
    if (!r.ok) {
      return NextResponse.json({ error: j.detail || "backend_error" }, { status: r.status });
    }

    // Preserve legacy frontend contract: static_mode → llm_not_configured + mockBrief
    if (j.static_mode) {
      return NextResponse.json({
        error: "llm_not_configured",
        message: lang === "fr"
          ? "Demo en mode statique — la cle LLM sera configuree au prochain deploiement."
          : "Static demo mode — LLM key will be configured at next deploy.",
        mockBrief: j.brief,
      });
    }

    return NextResponse.json({
      brief: j.brief,
      model: j.model,
      generatedAt: j.generated_at,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown_error";
    return NextResponse.json({ error: `backend_unreachable: ${msg}` }, { status: 502 });
  }
}
