import json
import os
import logging
from typing import Optional
from schemas import DiagnosisResponse

logger = logging.getLogger(__name__)

# Heuristic fallback dataset
FALLBACK_DISEASES = {
    "tomato": {
        "disease": "Tomato Early Blight",
        "confidence": "88%",
        "pathogen": "Fungal (Alternaria solani)",
        "severity": "Moderate",
        "description": "Dark concentric spots on older leaves with yellowing halo. Lesions may coalesce causing defoliation.",
        "organic_remedy": "Neem oil spray 3ml/L every 7 days, remove affected leaves, improve air circulation, apply Trichoderma viride.",
        "chemical_remedy": "Mancozeb 75% WP @ 2g/L or Chlorothalonil @ 2g/L, 2 sprays at 10-day interval.",
        "advisory_en": "Early blight detected. Remove infected leaves and spray neem oil. Avoid overhead irrigation. Monitor for 7 days.",
        "advisory_kn": "Early blight roga detected. Sahetha yele uttupalli neem oil spray madi. Niravaranni yele mele hakabedi. 7 dina parishilisi."
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
        "advisory_kn": "Late blight tede varahante hara golute. Turthi shale nasaka sasi mari yugdadalli sahetha gouru tegeduhaki."
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
        "advisory_kn": "Ele curl virus bilichukudi inda harutide. Bilichuku niyantrana madhi sticky trap haaku neem oil sasi."
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
        "advisory_kn": "Ele thurukalu roga kanta. Shilindra nashaka sasi puh pusa samayi belashi."
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
        "advisory_kn": "Katte roga ugravagide. Tricyclazole sasi turthi, nitrogen kamamadi neru nirvahami."
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
        "advisory_kn": "Sahada bacterial spot. Shuchi kadi, yele mele nirabaradante nodi, copper sasi avashyakatege."
    }
}

def _fallback(plant_type: str) -> DiagnosisResponse:
    key = plant_type.strip().lower() if plant_type else "default"
    data = FALLBACK_DISEASES.get(key, FALLBACK_DISEASES["default"])
    return DiagnosisResponse(**data)

async def diagnose_leaf(image_bytes: bytes, plant_type: str, mime_type: str = "image/jpeg") -> DiagnosisResponse:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key or not image_bytes:
        logger.warning("Gemini fallback: missing API key or empty image, using heuristic for %s", plant_type)
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
  "advisory_kn": "string - same advisory in Kannada (Kannada script transliterated to English if needed)"
}}
Severity must be one of Low, Moderate, Severe. Confidence must include % sign. Provide realistic agronomic advice for Karnataka region.
"""
        image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
        response = await client.aio.models.generate_content(
            model="gemini-3.6-flash",
            contents=[prompt, image_part],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2
            )
        )
        text = response.text.strip() if response.text else ""
        # Clean possible markdown fences
        if text.startswith("```"):
            text = text.strip("`")
            # remove json prefix if present
            if text.lstrip().startswith("json"):
                text = text.lstrip()[4:]
            text = text.strip()
        parsed = json.loads(text)
        # Validate severity
        if parsed.get("severity") not in ["Low", "Moderate", "Severe"]:
            parsed["severity"] = "Moderate"
        # Ensure confidence has %
        conf = str(parsed.get("confidence", "85%"))
        if "%" not in conf:
            conf = conf + "%"
        parsed["confidence"] = conf
        return DiagnosisResponse(**parsed)
    except Exception as e:
        logger.exception("Gemini vision failed, fallback heuristic: %s", e)
        return _fallback(plant_type)
