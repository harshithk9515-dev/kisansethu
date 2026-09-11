import json
import os
import logging
from typing import List, Optional
from schemas import SoilAnalysisResponse, DiagnosisResponse, MandiRate, UnifiedActionPlanResponse

logger = logging.getLogger(__name__)

async def orchestrate_decision(
    user_query: Optional[str],
    soil: SoilAnalysisResponse,
    disease: Optional[DiagnosisResponse],
    mandi_rates: List[MandiRate]
) -> UnifiedActionPlanResponse:
    """
    Gemini-Driven Orchestration: Universal Bridge
    Converts messy farmer intent + soil chemistry + mandi shifts + leaf pathogen into verified structured action plan.
    Falls back to deterministic composition if Gemini unavailable.
    """
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    # Prepare context for Gemini
    soil_ctx = f"Status: {soil.status}, Score: {soil.suitability_score}/100, Deficiencies: {soil.deficiencies}, Rec: {soil.recommendation}"
    disease_ctx = "No disease scan performed." if not disease else f"Disease: {disease.disease}, Severity: {disease.severity}, Confidence: {disease.confidence}, Pathogen: {disease.pathogen}, Desc: {disease.description}"
    mandi_ctx_lines = []
    for r in mandi_rates[:6]:
        mandi_ctx_lines.append(f"{r.crop} at {r.mandi}: Rs.{r.modal_price}/qtl {r.change_pct:+.1f}% trend:{r.trend} signal:{r.signal}")
    mandi_ctx = "; ".join(mandi_ctx_lines) if mandi_ctx_lines else "No mandi data"
    query_ctx = user_query.strip() if user_query and user_query.strip() else "What should I do today on my farm?"

    try:
        if not api_key:
            raise RuntimeError("Missing GEMINI_API_KEY, using deterministic fallback")
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=api_key)
        prompt = f"""
You are KisanSetu - an expert agronomist AI for Karnataka farmers. Act as Universal Bridge.

Farmer query (messy intent, may be Kannada/English/voice transcription): "{query_ctx}"
Soil analysis: {soil_ctx}
Disease diagnosis: {disease_ctx}
Mandi market rates: {mandi_ctx}

Task: Synthesize into a verified, structured daily farm action plan.
Return ONLY valid JSON with exactly 3 fields, no markdown, no extra keys:
{{
  "executive_advisory_en": "string - 3-4 sentences, clear, actionable, in English, must reference soil + disease + market together",
  "executive_advisory_kn": "string - same advisory accurately translated to Kannada, transliterated to Latin if Kannada script not supported but prefer Kannada script",
  "priority_action": "string - single line imperative, e.g. Spray Mancozeb today and HOLD Tomato for 3 days for price rise"
}}
Priority action must be decisive: include HOLD/SELL/BUY signal if market relevant, and disease urgency if severe.
Be concise, farmer-friendly, avoid jargon. Mention specific mandi if signal is HOLD/SELL.
"""
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.3
            )
        )
        text = response.text.strip() if response.text else ""
        if text.startswith("```"):
            text = text.strip("`")
            if text.lstrip().startswith("json"):
                text = text.lstrip()[4:]
            text = text.strip()
        parsed = json.loads(text)
        advisory_en = parsed.get("executive_advisory_en", "")
        advisory_kn = parsed.get("executive_advisory_kn", "")
        priority = parsed.get("priority_action", "")
        if not advisory_en or not advisory_kn or not priority:
            raise ValueError("Gemini returned incomplete fields")
        return UnifiedActionPlanResponse(
            soil_summary=soil,
            disease_summary=disease,
            mandi_highlights=mandi_rates[:6],
            executive_advisory_en=advisory_en,
            executive_advisory_kn=advisory_kn,
            priority_action=priority
        )
    except Exception as e:
        logger.warning("Orchestrator Gemini fallback: %s", e)
        # Deterministic fallback composition
        parts_en = []
        parts_kn = []
        # Soil part
        if soil.suitability_score >= 80:
            parts_en.append(f"Soil is excellent ({soil.suitability_score}/100) for the crop.")
            parts_kn.append(f"Manu uttama sthitiyalli ide ({soil.suitability_score}/100).")
        elif soil.suitability_score >= 60:
            parts_en.append(f"Soil is good ({soil.suitability_score}/100) but watch deficiencies.")
            parts_kn.append(f"Manu chennagide ({soil.suitability_score}/100) adare korathegala bagge gamanisi.")
        else:
            parts_en.append(f"Soil needs attention ({soil.suitability_score}/100): " + "; ".join(soil.deficiencies[:2]) + ".")
            parts_kn.append(f"Manige gamanav agatya ({soil.suitability_score}/100).")
        # Disease part
        if disease:
            if disease.severity == "Severe":
                parts_en.append(f"Urgently treat {disease.disease} ({disease.severity}) with {disease.chemical_remedy[:60]}.")
                parts_kn.append(f"Turthe {disease.disease} ge chikitsa madi.")
            elif disease.severity == "Moderate":
                parts_en.append(f"Monitor {disease.disease} and apply {disease.organic_remedy[:60]}.")
                parts_kn.append(f"{disease.disease} parishilisi sasyava.")
            else:
                parts_en.append(f"Low severity {disease.disease} - maintain hygiene.")
                parts_kn.append(f"Saamanya roga - svacchate kadi.")
        else:
            parts_en.append("No disease detected recently; continue scouting.")
            parts_kn.append("Yavude roga kaanisilla; parishilane mundhuvarisi.")

        # Mandi part - pick best HOLD vs SELL
        hold_crops = [r for r in mandi_rates if r.signal == "HOLD" and r.change_pct > 5]
        sell_crops = [r for r in mandi_rates if r.signal == "SELL"]
        if hold_crops:
            top = hold_crops[0]
            parts_en.append(f"Market: {top.crop} at {top.mandi} appreciating {top.change_pct:+.1f}% -- HOLD for 3-4 days.")
            parts_kn.append(f"Marukatte: {top.crop} {top.mandi} alli bele erike {top.change_pct:+.1f}% -- 3-4 dina hold madi.")
            priority = f"HOLD {top.crop} at {top.mandi} (+{top.change_pct:.1f}%) and address soil/disease today"
        elif sell_crops:
            top = sell_crops[0]
            parts_en.append(f"Market: {top.crop} at {top.mandi} falling {top.change_pct:+.1f}% -- SELL soon.")
            parts_kn.append(f"Marukatte: {top.crop} {top.mandi} bele ilike -- bega marata madi.")
            priority = f"SELL {top.crop} at {top.mandi} before further fall and treat crop health"
        else:
            if mandi_rates:
                top = mandi_rates[0]
                parts_en.append(f"Market stable for {top.crop} at {top.mandi} Rs.{top.modal_price}/qtl.")
                parts_kn.append(f"Marukatte sthira: {top.crop} {top.mandi}.")
                priority = f"Focus on soil/disease management today; market stable for {top.crop}"
            else:
                parts_en.append("Market data unavailable; prioritize field health.")
                parts_kn.append("Marukatte mahiti illa; gaddi aarogya mukhya.")
                priority = "Prioritize soil correction and disease scouting today"

        advisory_en = " ".join(parts_en)
        advisory_kn = " ".join(parts_kn)
        # If user query present, prepend context
        if query_ctx and query_ctx != "What should I do today on my farm?":
            advisory_en = f"For your query \"{query_ctx}\": " + advisory_en
            advisory_kn = f"Nimma prashne \"{query_ctx}\" ge: " + advisory_kn

        return UnifiedActionPlanResponse(
            soil_summary=soil,
            disease_summary=disease,
            mandi_highlights=mandi_rates[:6],
            executive_advisory_en=advisory_en,
            executive_advisory_kn=advisory_kn,
            priority_action=priority
        )
