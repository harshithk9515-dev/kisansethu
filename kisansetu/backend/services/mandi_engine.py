import json
import pathlib
from typing import List, Optional
from schemas import MandiRate

DATA_PATH = pathlib.Path(__file__).parent.parent / "data" / "mandi_rates.json"

_cache = None

def _load_rates():
    global _cache
    if _cache is None:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            _cache = json.load(f)
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
        if crop_filter and row["crop"].lower() != crop_filter.lower():
            continue
        change = float(row["change_pct"])
        trend = compute_trend(change)
        signal = compute_signal(change)
        # BUY logic: if price appreciating strongly and trend up, but spec says HOLD/SELL; we map strong up to BUY only if we want to diversify
        # Keep algorithmic: HOLD if appreciating >5% else SELL if falling, else HOLD. No BUY in default per spec, but keep BUY available for future.
        # For now, respect spec: >5 HOLD, < -3 SELL, else HOLD
        result.append(MandiRate(
            crop=row["crop"],
            mandi=row["mandi"],
            state=row["state"],
            modal_price=float(row["modal_price"]),
            change_pct=change,
            trend=trend,
            signal=signal
        ))
    return result
