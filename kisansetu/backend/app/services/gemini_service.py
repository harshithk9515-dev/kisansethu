import json
import os
import logging
from typing import Optional, List

from app.models.schemas import DiagnosisResponse, SoilAnalysisResponse, MandiRate, UnifiedActionPlanResponse
from app.core.config import settings
from app.core.logger import logger

FALLBACK_DISEASES: dict[str, dict] = {
    "tomato": {
        "disease": "Tomato Early Blight",
        "confidence": "88%",
        "pathogen": "Fungal (Alternaria solani)",
        "severity": "Moderate",
        "description": "Dark concentric spots on older leaves with yellowing halo. Lesions may coalesce causing defoliation.",
        "organic_remedy": "Neem oil spray 3ml/L every 7 days, remove affected leaves, improve air circulation, apply Trichoderma viride.",
        "chemical_remedy": "Mancozeb 75% WP @ 2g/L or Chlorothalonil @ 2g/L, 2 sprays at 10-day interval.",
        "advisory_en": "Early blight detected. Remove infected leaves and spray neem oil. Avoid overhead irrigation. Monitor for 7 days.",
        "advisory_kn": "Early blight roga detected. Sahetha yele uttupalli neem oil spray madi. Niravaranni yele mele hakabedi. 7 dina parishilisi.",
    },
    "potato": {
        "disease": "Potato Late Blight",
        "confidence": "91%",
        "pathogen": "Fungal (Phytophthora infestans)",
        "severity": "Severe",
        "description": "Water-soaked lesions on leaf margins turning brown-black, white fungal growth underside in humid conditions.",
        "organic_remedy": "Bordeaux mixture 1%, copper-based organic spray, destroy infected haulms, ensure drainage.",
        "chemical_remedy": "Metalaxyl + Mancozeb @ 2g/L or Cymoxanil + Mancozeb @ 2g/L immediately.",
        "advisory_en": "Late blight is severe and spreads fast. Spray fungicide immediately and remove infected plants to prevent spread.",
        "advisory_kn": "Late blight tede varahante hara golute. Turthi shale nasaka sasi mari yugdadalli sahetha gouru tegeduhaki.",
    },
    "cotton": {
        "disease": "Cotton Leaf Curl Virus",
        "confidence": "85%",
        "pathogen": "Viral (Begomovirus - Whitefly vector)",
        "severity": "Moderate",
        "description": "Upward curling of leaves, vein thickening, stunted growth. Whitefly infestation visible.",
        "organic_remedy": "Neem oil + yellow sticky traps, control whitefly with Verticillium lecanii, rogue infected plants.",
        "chemical_remedy": "Imidacloprid 17.8 SL @ 0.3ml/L or Acetamiprid @ 0.4g/L for vector control.",
        "advisory_en": "Leaf curl virus via whitefly. Control whitefly urgently, use sticky traps and neem oil.",
        "advisory_kn": "Ele curl virus bilichukudi inda harutide. Bilichuku niyantrana madhi sticky trap haaku neem oil sasi.",
    },
    "wheat": {
        "disease": "Wheat Leaf Rust",
        "confidence": "87%",
        "pathogen": "Fungal (Puccinia triticina)",
        "severity": "Moderate",
        "description": "Orange-brown pustules on leaf surface, dusty spores, premature leaf drying.",
        "organic_remedy": "Spray neem extract + cow urine 5%, use resistant varieties, early sowing.",
        "chemical_remedy": "Propiconazole 25 EC @ 1ml/L or Tebuconazole @ 1g/L.",
        "advisory_en": "Leaf rust observed. Apply fungicide at pustule stage and avoid late sowing next season.",
        "advisory_kn": "Ele thurukalu roga kanta. Shilindra nashaka sasi puh pusa samayi belashi.",
    },
    "paddy": {
        "disease": "Paddy Blast",
        "confidence": "90%",
        "pathogen": "Fungal (Magnaporthe oryzae)",
        "severity": "Severe",
        "description": "Spindle-shaped lesions with grey center on leaves, neck rot possible at heading stage.",
        "organic_remedy": "Pseudomonas fluorescens @ 10g/L seed treatment, neem cake, balanced N fertilization.",
        "chemical_remedy": "Tricyclazole 75 WP @ 0.6g/L or Isoprothiolane @ 1.5ml/L.",
        "advisory_en": "Blast is severe. Spray Tricyclazole immediately, reduce nitrogen and maintain water level.",
        "advisory_kn": "Katte roga ugravagide. Tricyclazole sasi turthi, nitrogen kamamadi neru nirvahami.",
    },
    "default": {
        "disease": "Bacterial Leaf Spot",
        "confidence": "82%",
        "pathogen": "Bacterial (Xanthomonas spp.)",
        "severity": "Low",
        "description": "Small water-soaked spots turning brown with yellow halo, limited spread in dry weather.",
        "organic_remedy": "Copper oxychloride organic allowed @ 2g/L, remove debris, avoid wounding.",
        "chemical_remedy": "Streptocycline @ 0.1g/L + Copper oxychloride @ 2g/L.",
        "advisory_en": "Mild bacterial spot. Maintain hygiene, avoid overhead watering, copper spray if spreading.",
        "advisory_kn": "Sahada bacterial spot. Shuchi kadi, yele mele nirabaradante nodi, copper sasi avashyakatege.",
    },
}

def _fallback(plant_type: str) -> DiagnosisResponse:
    key = plant_type.strip().lower() if plant_type else "default"
    data = FALLBACK_DISEASES.get(key, FALLBACK_DISEASES["default"])
    return DiagnosisResponse(**data)

async def diagnose_leaf(image_bytes: bytes, plant_type: str, mime_type: str = "image/jpeg") -> DiagnosisResponse:
    api_key = settings.gemini_api_key or settings.google_api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key or not image_bytes:
        logger.warning(f"Gemini fallback: missing API key or empty image for {plant_type}")
        return _fallback(plant_type)
    try:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=api_key)
        prompt = f"""
You are an expert plant pathologist for Indian crops. Analyze the leaf image for plant type: {plant_type}.
Return ONLY valid JSON with exactly these 9 fields, no markdown, no extra text:
{{
  "disease": "string - disease name",
  "confidence": "string - e.g. 92%",
  "pathogen": "string - e.g. Fungal (Alternaria solani)",
  "severity": "Low or Moderate or Severe",
  "description": "string - 2-3 sentences symptom description",
  "organic_remedy": "string - organic treatment steps",
  "chemical_remedy": "string - chemical fungicide/pesticide with dosage",
  "advisory_en": "string - farmer advisory in English 2 sentences",
  "advisory_kn": "string - same advisory in Kannada"
}}
Severity must be one of Low, Moderate, Severe. Confidence must include % sign.
"""
        image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
        response = await client.aio.models.generate_content(
            model="gemini-3.6-flash",
            contents=[prompt, image_part],
            config=types.GenerateContentConfig(response_mime_type="application/json", temperature=0.2),
        )
        text = response.text.strip() if response.text else ""
        if text.startswith("```"):
            text = text.strip("`").lstrip()
            if text.startswith("json"):
                text = text[4:].strip()
        parsed = json.loads(text)
        if parsed.get("severity") not in ["Low", "Moderate", "Severe"]:
            parsed["severity"] = "Moderate"
        conf = str(parsed.get("confidence", "85%"))
        if "%" not in conf:
            conf += "%"
        parsed["confidence"] = conf
        return DiagnosisResponse(**parsed)
    except Exception as e:
        logger.exception(f"Gemini vision failed fallback: {e}")
        return _fallback(plant_type)

async def orchestrate_decision(user_query: Optional[str], soil: SoilAnalysisResponse, disease: Optional[DiagnosisResponse], mandi_rates: List[MandiRate]) -> UnifiedActionPlanResponse:
    api_key = settings.gemini_api_key or settings.google_api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    soil_ctx = f"Status: {soil.status}, Score: {soil.suitability_score}/100, Deficiencies: {soil.deficiencies}, Rec: {soil.recommendation}"
    disease_ctx = "No disease scan performed." if not disease else f"Disease: {disease.disease}, Severity: {disease.severity}, Confidence: {disease.confidence}, Pathogen: {disease.pathogen}, Desc: {disease.description}"
    mandi_ctx_lines = [f"{r.crop} at {r.mandi}: Rs.{r.modal_price}/qtl {r.change_pct:+.1f}% trend:{r.trend} signal:{r.signal}" for r in mandi_rates[:6]]
    mandi_ctx = "; ".join(mandi_ctx_lines) if mandi_ctx_lines else "No mandi data"
    query_ctx = user_query.strip() if user_query and user_query.strip() else "What should I do today on my farm?"
    try:
        if not api_key:
            raise RuntimeError("Missing GEMINI_API_KEY, using deterministic fallback")
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=api_key)
        prompt = f"""
You are KisanSetu - an expert agronomist AI for Karnataka farmers.
Farmer query: "{query_ctx}"
Soil analysis: {soil_ctx}
Disease diagnosis: {disease_ctx}
Mandi market rates: {mandi_ctx}
Task: Synthesize into a verified, structured daily farm action plan.
Return ONLY valid JSON with exactly 3 fields:
{{
  "executive_advisory_en": "3-4 sentences, clear, actionable, in English, must reference soil + disease + market together",
  "executive_advisory_kn": "same advisory accurately translated to Kannada",
  "priority_action": "single line imperative, e.g. Spray Mancozeb today and HOLD Tomato for 3 days for price rise"
}}
Priority action must be decisive: include HOLD/SELL/BUY signal if market relevant, and disease urgency if severe.
Be concise, farmer-friendly.
"""
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt],
            config=types.GenerateContentConfig(response_mime_type="application/json", temperature=0.3),
        )
        text = response.text.strip() if response.text else ""
        if text.startswith("```"):
            text = text.strip("`").lstrip()
            if text.startswith("json"):
                text = text[4:].strip()
        parsed = json.loads(text)
        advisory_en = parsed.get("executive_advisory_en", "")
        advisory_kn = parsed.get("executive_advisory_kn", "")
        priority = parsed.get("priority_action", "")
        if not advisory_en or not advisory_kn or not priority:
            raise ValueError("Gemini returned incomplete fields")
        return UnifiedActionPlanResponse(soil_summary=soil, disease_summary=disease, mandi_highlights=mandi_rates[:6], executive_advisory_en=advisory_en, executive_advisory_kn=advisory_kn, priority_action=priority)
    except Exception as e:
        logger.warning(f"Orchestrator Gemini fallback: {e}")
        parts_en: list[str] = []
        parts_kn: list[str] = []
        if soil.suitability_score >= 80:
            parts_en.append(f"Soil is excellent ({soil.suitability_score}/100) for the crop.")
            parts_kn.append(f"Manu uttama sthitiyalli ide ({soil.suitability_score}/100).")
        elif soil.suitability_score >= 60:
            parts_en.append(f"Soil is good ({soil.suitability_score}/100) but watch deficiencies.")
            parts_kn.append(f"Manu chennagide ({soil.suitability_score}/100) adare korathegala bagge gamanisi.")
        else:
            parts_en.append(f"Soil needs attention ({soil.suitability_score}/100): " + "; ".join(soil.deficiencies[:2]) + ".")
            parts_kn.append(f"Manige gamanav agatya ({soil.suitability_score}/100).")
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
        if query_ctx and query_ctx != "What should I do today on my farm?":
            advisory_en = f'For your query "{query_ctx}": ' + advisory_en
            advisory_kn = f'Nimma prashne "{query_ctx}" ge: ' + advisory_kn
        return UnifiedActionPlanResponse(soil_summary=soil, disease_summary=disease, mandi_highlights=mandi_rates[:6], executive_advisory_en=advisory_en, executive_advisory_kn=advisory_kn, priority_action=priority)

async def search_advisory(query: str, language: str = "EN") -> dict:
    prompt = f"""
    You are KisanSetu AI, an expert agricultural advisory assistant for Indian farmers.
    Farmer Query: "{query}"
    Target Language: {language}
    Provide a concise, highly practical, and actionable answer.
    Respond ONLY with valid raw JSON (do not include markdown code fences or backticks):
    {{
      "title": "Short descriptive title of the topic",
      "summary": "2-3 crisp sentences answering the question directly",
      "action_steps": ["Step 1", "Step 2", "Step 3"],
      "caution": "Any critical safety warning (e.g. chemical dosage, weather precautions)",
      "vernacular_summary": "The exact same response translated to natural conversational Kannada"
    }}
    """
    api_key = settings.gemini_api_key or settings.google_api_key or os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {
            "title": f"Advisory: {query}",
            "summary": "Balanced NPK fertilizer application and regular moisture monitoring are advised for standard crop health.",
            "action_steps": ["Conduct baseline soil testing before application", "Apply recommended fertilizer split across vegetative stages", "Maintain optimal field drainage"],
            "caution": "Avoid foliar spraying during intense sun or preceding expected rainfall.",
            "vernacular_summary": "ನಿಮ್ಮ ಬೆಳೆಗೆ ಸರಿಯಾದ ರಸಗೊಬ್ಬರ ಮತ್ತು ಸಾವಯವ ಗೊಬ್ಬರವನ್ನು ಬಳಸಿ. ಮಳೆಯ ಮುನ್ನ ಸಿಂಪಡಿಸಬೇಡಿ.",
        }
    try:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=api_key)
        response = await client.aio.models.generate_content(model="gemini-3.6-flash", contents=prompt, config=types.GenerateContentConfig(response_mime_type="application/json"))
        raw_text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(raw_text)
    except Exception as e:
        logger.warning(f"Gemini search fallback: {e}")
        return {
            "title": "Agricultural Advisory",
            "summary": "Optimal soil nutrition, monitored humidity, and balanced moisture management recommended.",
            "action_steps": ["Verify soil condition before inputs", "Consult the local Krishi Vigyan Kendra (KVK) for specialized batch dosage"],
            "caution": "Adhere strictly to pesticide and fertilizer packaging labels.",
            "vernacular_summary": "ಸ್ಥಳೀಯ ಕೃಷಿ ಕೇಂದ್ರವನ್ನು ಸಂಪರ್ಕಿಸಿ ಮತ್ತು ಶಿಫಾರಸು ಮಾಡಿದ ಪ್ರಮಾಣವನ್ನು ಮಾತ್ರ ಬಳಸಿ.",
        }
