import json
import pathlib
from typing import List

from app.models.schemas import SoilAnalysisRequest, SoilAnalysisResponse
from app.core.logger import logger

DATA_PATH = pathlib.Path(__file__).parent.parent / "data" / "soil_rules.json"

_rules_cache = None

def _load_rules() -> dict:
    global _rules_cache
    if _rules_cache is None:
        try:
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                _rules_cache = json.load(f)
            logger.info("Loaded soil_rules.json")
        except Exception as e:
            logger.warning(f"Failed to load soil_rules.json: {e}")
            _rules_cache = {}
    return _rules_cache

def analyze_soil(req: SoilAnalysisRequest) -> SoilAnalysisResponse:
    rules: dict = _load_rules()
    crop: str = req.crop.strip().title()
    if crop not in rules:
        logger.warning(f"Unknown crop {crop}, fallback to Wheat")
        crop = "Wheat"
    if crop not in rules:
        raise ValueError(f"No rules for crop {crop}")
    crop_rules: dict = rules[crop]

    deficiencies: List[str] = []
    recommendations: List[str] = []
    score: int = 100

    n_rule = crop_rules["nitrogen"]
    n = float(req.nitrogen)
    if n < n_rule["optimal_min"]:
        deficiencies.append(f"Nitrogen deficiency: {n:.1f} kg/ha (optimal {n_rule['optimal_min']}-{n_rule['optimal_max']})")
        recommendations.append(f"Apply Urea ~{int((n_rule['optimal_min'] - n) * 2.17)} kg/ha to correct N deficit")
        score -= 20
    elif n > n_rule["excess_min"]:
        deficiencies.append(f"Nitrogen excess: {n:.1f} kg/ha (optimal {n_rule['optimal_min']}-{n_rule['optimal_max']})")
        recommendations.append("Reduce nitrogen fertilizer; consider flushing with irrigation")
        score -= 15
    else:
        recommendations.append("Nitrogen level optimal")

    p_rule = crop_rules["phosphorus"]
    phos = float(req.phosphorus)
    if phos < p_rule["optimal_min"]:
        deficiencies.append(f"Phosphorus deficiency: {phos:.1f} kg/ha (optimal {p_rule['optimal_min']}-{p_rule['optimal_max']})")
        recommendations.append(f"Apply DAP/SSP ~{int((p_rule['optimal_min'] - phos) * 2.5)} kg/ha")
        score -= 20
    elif phos > p_rule["excess_min"]:
        deficiencies.append(f"Phosphorus excess: {phos:.1f} kg/ha")
        recommendations.append("Avoid further P application this season")
        score -= 10
    else:
        recommendations.append("Phosphorus level optimal")

    k_rule = crop_rules["potassium"]
    pot = float(req.potassium)
    if pot < k_rule["optimal_min"]:
        deficiencies.append(f"Potassium deficiency: {pot:.1f} kg/ha (optimal {k_rule['optimal_min']}-{k_rule['optimal_max']})")
        recommendations.append(f"Apply MOP ~{int((k_rule['optimal_min'] - pot) * 1.8)} kg/ha")
        score -= 20
    elif pot > k_rule["excess_min"]:
        deficiencies.append(f"Potassium excess: {pot:.1f} kg/ha")
        recommendations.append("Reduce potassium input; ensure balanced NPK")
        score -= 10
    else:
        recommendations.append("Potassium level optimal")

    ph_rule = crop_rules["ph"]
    ph = float(req.ph)
    if ph < ph_rule["optimal_min"]:
        deficiencies.append(f"Soil acidic: pH {ph:.1f} (optimal {ph_rule['optimal_min']}-{ph_rule['optimal_max']})")
        recommendations.append("Apply agricultural lime 200-300 kg/ha; add organic matter")
        score -= 15
    elif ph > ph_rule["optimal_max"]:
        deficiencies.append(f"Soil alkaline: pH {ph:.1f} (optimal {ph_rule['optimal_min']}-{ph_rule['optimal_max']})")
        recommendations.append("Apply gypsum 150-250 kg/ha; use sulfur-based amendments")
        score -= 15
    else:
        recommendations.append(f"pH optimal for {crop}")

    score = max(0, min(100, score))

    if score >= 80:
        status = "Excellent"
    elif score >= 60:
        status = "Good"
    elif score >= 40:
        status = "Needs Attention"
    else:
        status = "Poor - Immediate Action Required"

    recommendation_text = "; ".join(recommendations) + f". Suitable for {crop} with suitability {score}/100. "
    if deficiencies:
        recommendation_text = "Deficiencies found: " + "; ".join(deficiencies) + ". " + recommendation_text
    else:
        recommendation_text = f"Soil is well balanced for {crop}. " + recommendation_text + "Maintain current practices with regular monitoring."

    return SoilAnalysisResponse(
        status=status,
        deficiencies=deficiencies,
        recommendation=recommendation_text,
        suitability_score=score,
    )
