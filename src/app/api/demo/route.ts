import { NextResponse } from "next/server";
import { chat, isConfigured } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT_FR = `Tu es EdgeAI, un agent IA expert en deploiement de modeles ML embarques sur hardware contraint (Raspberry Pi, NVIDIA Jetson, STM32, ESP32). Tu produis un rapport d'optimisation pour un ingenieur ML qui veut deployer son modele en edge.

Format de sortie exact en MARKDOWN :
**🎯 Profil cible**
- [Hardware identifie : CPU/GPU/MCU, RAM disponible, contraintes thermiques]
- [Modele d'origine : framework, taille estimee, FLOPs]

**⚙️ Plan de quantization**
- [Strategie recommandee : INT8 / FP16 / pruning, gain de taille attendu]
- [Format d'export optimal : ONNX, TFLite, TensorRT, CMSIS-NN]
- [Risque de perte de precision et mitigation]

**📊 Benchmark estime**
- [Latence inference par echantillon (ms)]
- [Throughput attendu (inferences/sec)]
- [Consommation memoire RAM (MB)]
- [Consommation energetique (mW si applicable)]

**⚡ Etapes de deploiement**
- [3 etapes concretes : compression, validation, OTA rollout]

Tu DOIS inventer des chiffres realistes (pas de "je n'ai pas access au modele"). Tu joues le role d'un ingenieur edge senior qui a deja deploye sur ce type de cible. Reste technique et factuel, evite l'enthousiasme commercial. Maximum 350 mots.`;

const SYSTEM_PROMPT_EN = `You are EdgeAI, an expert AI agent for deploying ML models on constrained hardware (Raspberry Pi, NVIDIA Jetson, STM32, ESP32). You produce an optimization report for an ML engineer who wants to deploy their model at the edge.

Exact MARKDOWN output format:
**🎯 Target profile**
- [Identified hardware: CPU/GPU/MCU, available RAM, thermal constraints]
- [Source model: framework, estimated size, FLOPs]

**⚙️ Quantization plan**
- [Recommended strategy: INT8 / FP16 / pruning, expected size gain]
- [Optimal export format: ONNX, TFLite, TensorRT, CMSIS-NN]
- [Precision loss risk and mitigation]

**📊 Estimated benchmark**
- [Inference latency per sample (ms)]
- [Expected throughput (inferences/sec)]
- [RAM memory consumption (MB)]
- [Power consumption (mW if applicable)]

**⚡ Deployment steps**
- [3 concrete steps: compression, validation, OTA rollout]

You MUST invent realistic numbers (no "I have no model access"). You play the role of a senior edge engineer who has deployed on this target. Stay technical and factual, avoid commercial enthusiasm. Maximum 350 words.`;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const device: string = typeof body.device === "string" ? body.device.trim().slice(0, 80) : "";
    const model: string = typeof body.model === "string" ? body.model.trim().slice(0, 120) : "";
    const lang: "fr" | "en" = body.lang === "en" ? "en" : "fr";

    if (!device || !model) {
      return NextResponse.json(
        { error: lang === "fr" ? "Selectionnez une cible hardware et un modele." : "Select a hardware target and a model." },
        { status: 400 }
      );
    }

    if (!isConfigured()) {
      return NextResponse.json(
        {
          error: "llm_not_configured",
          message: lang === "fr"
            ? "Demo en mode statique — la cle LLM sera configuree au prochain deploiement."
            : "Static demo mode — LLM key will be configured at next deploy.",
          mockBrief: buildMockBrief(device, model, lang),
        },
        { status: 200 }
      );
    }

    const userMsg = lang === "fr"
      ? `Cible hardware : ${device}. Modele d'origine : ${model}. Genere le plan d'optimisation et de deploiement edge complet.`
      : `Hardware target: ${device}. Source model: ${model}. Generate the full edge optimization and deployment plan.`;

    const { text, model: usedModel } = await chat(
      [
        { role: "system", content: lang === "fr" ? SYSTEM_PROMPT_FR : SYSTEM_PROMPT_EN },
        { role: "user", content: userMsg },
      ],
      900
    );

    return NextResponse.json({ brief: text, model: usedModel, generatedAt: new Date().toISOString() });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function buildMockBrief(device: string, model: string, lang: "fr" | "en"): string {
  if (lang === "en") {
    return `**🎯 Target profile**\n- ${device} — ARM Cortex-A72 quad-core 1.5GHz, 4GB LPDDR4, passive cooling envelope ~5W TDP.\n- ${model} — PyTorch FP32, ~38MB on disk, ~1.2 GFLOPs per forward pass.\n\n**⚙️ Quantization plan**\n- INT8 post-training quantization with calibration set of 500 samples. Expected size: 38MB → 9.5MB (-75%).\n- Export to ONNX then convert to TFLite with XNNPACK delegate. Best inference performance on this target.\n- Top-1 accuracy drop estimated at 0.6%, mitigated via per-channel quantization on conv layers.\n\n**📊 Estimated benchmark**\n- Inference latency: 8.4ms per sample (vs 42ms FP32).\n- Throughput: ~118 inferences/sec single-threaded.\n- RAM peak: 76MB during inference.\n- Power: ~1.8W average under continuous load.\n\n**⚡ Deployment steps**\n- Run CI quantization pipeline, validate on holdout set, sign artifact with Sigstore.\n- Push to internal OTA server, canary on 5% of fleet for 24h.\n- Promote to 100% on green metrics, keep N-1 image for one-command rollback.`;
  }
  return `**🎯 Profil cible**\n- ${device} — ARM Cortex-A72 quad-core 1.5GHz, 4Go LPDDR4, enveloppe thermique passive ~5W TDP.\n- ${model} — PyTorch FP32, ~38Mo sur disque, ~1.2 GFLOPs par forward pass.\n\n**⚙️ Plan de quantization**\n- Quantization post-training INT8 avec set de calibration de 500 echantillons. Taille attendue : 38Mo → 9.5Mo (-75%).\n- Export ONNX puis conversion TFLite avec delegate XNNPACK. Meilleure performance d'inference sur cette cible.\n- Perte de precision top-1 estimee a 0.6%, mitigee par quantization per-channel sur les couches conv.\n\n**📊 Benchmark estime**\n- Latence inference : 8.4ms par echantillon (vs 42ms FP32).\n- Throughput : ~118 inferences/sec en mono-thread.\n- Pic RAM : 76Mo pendant l'inference.\n- Consommation : ~1.8W moyenne sous charge continue.\n\n**⚡ Etapes de deploiement**\n- Lancer pipeline CI quantization, valider sur set holdout, signer artefact avec Sigstore.\n- Push vers serveur OTA interne, canary sur 5% de la flotte pendant 24h.\n- Promotion 100% sur metriques vertes, conservation image N-1 pour rollback en une commande.`;
}
