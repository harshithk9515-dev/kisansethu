import json
import pathlib
from typing import List, Optional

from app.models.schemas import MandiRate
from app.core.logger import logger

DATA_PATH = pathlib.Path(__file__).parent.parent / "data" / "mandi_rates.json"

_cache = None

def _load_rates() -> List[dict]:
    global _cache
    if _cache is None:
        try:
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                _cache = json.load(f)
            logger.info("Loaded mandi_rates.json")
        except Exception as e:
            logger.warning(f"Failed to load mandi_rates.json: {e}")
            _cache = []
    return _cache

def compute_signal(change_pct: float) -> str:
    if change_pct > 5.0:
        return "HOLD"
    if change_pct < -3.0:
        return "SELL"
    return "HOLD"

def compute_trend(change_pct: float) -> str:
    if change_pct > 1.0:
        return "up"
    if change_pct < -1.0:
        return "down"
    return "neutral"

def get_rates(crop_filter: Optional[str] = None) -> List[MandiRate]:
    raw = _load_rates()
    result: List[MandiRate] = []
    for row in raw:
        if crop_filter and row.get("crop", "").lower() != crop_filter.lower():
            continue
        try:
            change = float(row["change_pct"])
            trend = compute_trend(change)
            signal = compute_signal(change)
            result.append(MandiRate(
                crop=row["crop"],
                mandi=row["mandi"],
                state=row["state"],
                modal_price=float(row["modal_price"]),
                change_pct=change,
                trend=trend,
                signal=signal,
            ))
        except Exception as e:
            logger.warning(f"Skipping mandi row {row}: {e}")
            continue
    return result
