"""EdgeAI demo backend — production-ready POC.

In production: this service would also run quantization pipelines, sign artifacts,
push to an OTA server and orchestrate canary rollouts.
For the demo: it only invokes the LLM and returns the brief.
"""
from datetime import datetime, timezone
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .llm import chat, is_configured

app = FastAPI(
    title="EdgeAI Demo Backend",
    description="POC backend — Groq/Gemini LLM. No third-party connections.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# Prompts
# ─────────────────────────────────────────────────────────────────────────────
SYSTEM_PROMPT_FR = """Tu es EdgeAI, un agent IA expert en deploiement de modeles ML embarques sur hardware contraint (Raspberry Pi, NVIDIA Jetson, STM32, ESP32). Tu produis un rapport d'optimisation pour un ingenieur ML qui veut deployer son modele en edge.

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

Tu DOIS inventer des chiffres realistes (pas de "je n'ai pas access au modele"). Tu joues le role d'un ingenieur edge senior qui a deja deploye sur ce type de cible. Reste technique et factuel, evite l'enthousiasme commercial. Maximum 350 mots."""

SYSTEM_PROMPT_EN = """You are EdgeAI, an expert AI agent for deploying ML models on constrained hardware (Raspberry Pi, NVIDIA Jetson, STM32, ESP32). You produce an optimization report for an ML engineer who wants to deploy their model at the edge.

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

You MUST invent realistic numbers (no "I have no model access"). You play the role of a senior edge engineer who has deployed on this target. Stay technical and factual, avoid commercial enthusiasm. Maximum 350 words."""


# ─────────────────────────────────────────────────────────────────────────────
# Models
# ─────────────────────────────────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    device: str = Field(..., min_length=1, max_length=80)
    model_name: str = Field(..., min_length=1, max_length=120)
    lang: Literal["fr", "en"] = "fr"


class GenerateResponse(BaseModel):
    brief: str
    model: str
    generated_at: str
    static_mode: bool = False


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "edgeai-backend",
        "llm_configured": is_configured(),
    }


@app.post("/process", response_model=GenerateResponse)
async def process(req: GenerateRequest) -> GenerateResponse:
    device = req.device.strip()
    model_name = req.model_name.strip()
    if not device or not model_name:
        raise HTTPException(status_code=400, detail="missing_device_or_model")

    now_iso = datetime.now(timezone.utc).isoformat()
    user_msg = (
        f"Cible hardware : {device}. Modele d'origine : {model_name}. Genere le plan d'optimisation et de deploiement edge complet."
        if req.lang == "fr"
        else f"Hardware target: {device}. Source model: {model_name}. Generate the full edge optimization and deployment plan."
    )

    if not is_configured():
        return GenerateResponse(
            brief=_build_mock_brief(device, model_name, req.lang),
            model="static-mock",
            generated_at=now_iso,
            static_mode=True,
        )

    try:
        text, model = await chat(
            [
                {"role": "system", "content": SYSTEM_PROMPT_FR if req.lang == "fr" else SYSTEM_PROMPT_EN},
                {"role": "user", "content": user_msg},
            ],
            max_tokens=900,
        )
    except Exception:
        return GenerateResponse(
            brief=_build_mock_brief(device, model_name, req.lang),
            model="static-mock",
            generated_at=now_iso,
            static_mode=True,
        )

    return GenerateResponse(brief=text, model=model, generated_at=now_iso)


# ─────────────────────────────────────────────────────────────────────────────
# Mock brief (used when no LLM key configured)
# ─────────────────────────────────────────────────────────────────────────────
def _build_mock_brief(device: str, model_name: str, lang: str) -> str:
    if lang == "en":
        return (
            f"**🎯 Target profile**\n"
            f"- {device} — ARM Cortex-A72 quad-core 1.5GHz, 4GB LPDDR4, passive cooling envelope ~5W TDP.\n"
            f"- {model_name} — PyTorch FP32, ~38MB on disk, ~1.2 GFLOPs per forward pass.\n\n"
            f"**⚙️ Quantization plan**\n"
            f"- INT8 post-training quantization with calibration set of 500 samples. Expected size: 38MB → 9.5MB (-75%).\n"
            f"- Export to ONNX then convert to TFLite with XNNPACK delegate. Best inference performance on this target.\n"
            f"- Top-1 accuracy drop estimated at 0.6%, mitigated via per-channel quantization on conv layers.\n\n"
            f"**📊 Estimated benchmark**\n"
            f"- Inference latency: 8.4ms per sample (vs 42ms FP32).\n"
            f"- Throughput: ~118 inferences/sec single-threaded.\n"
            f"- RAM peak: 76MB during inference.\n"
            f"- Power: ~1.8W average under continuous load.\n\n"
            f"**⚡ Deployment steps**\n"
            f"- Run CI quantization pipeline, validate on holdout set, sign artifact with Sigstore.\n"
            f"- Push to internal OTA server, canary on 5% of fleet for 24h.\n"
            f"- Promote to 100% on green metrics, keep N-1 image for one-command rollback."
        )
    return (
        f"**🎯 Profil cible**\n"
        f"- {device} — ARM Cortex-A72 quad-core 1.5GHz, 4Go LPDDR4, enveloppe thermique passive ~5W TDP.\n"
        f"- {model_name} — PyTorch FP32, ~38Mo sur disque, ~1.2 GFLOPs par forward pass.\n\n"
        f"**⚙️ Plan de quantization**\n"
        f"- Quantization post-training INT8 avec set de calibration de 500 echantillons. Taille attendue : 38Mo → 9.5Mo (-75%).\n"
        f"- Export ONNX puis conversion TFLite avec delegate XNNPACK. Meilleure performance d'inference sur cette cible.\n"
        f"- Perte de precision top-1 estimee a 0.6%, mitigee par quantization per-channel sur les couches conv.\n\n"
        f"**📊 Benchmark estime**\n"
        f"- Latence inference : 8.4ms par echantillon (vs 42ms FP32).\n"
        f"- Throughput : ~118 inferences/sec en mono-thread.\n"
        f"- Pic RAM : 76Mo pendant l'inference.\n"
        f"- Consommation : ~1.8W moyenne sous charge continue.\n\n"
        f"**⚡ Etapes de deploiement**\n"
        f"- Lancer pipeline CI quantization, valider sur set holdout, signer artefact avec Sigstore.\n"
        f"- Push vers serveur OTA interne, canary sur 5% de la flotte pendant 24h.\n"
        f"- Promotion 100% sur metriques vertes, conservation image N-1 pour rollback en une commande."
    )
