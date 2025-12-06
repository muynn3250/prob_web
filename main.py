from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yfinance as yf
import pandas as pd
import numpy as np   # <-- BẠN THIẾU IMPORT NÀY
from model import prepare_returns, estimate_parameters, simulate_jump_diffusion

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Request Body
# -----------------------------
class SimRequest(BaseModel):
    ticker: str
    horizon_days: int = 30
    M: int = 5000
    k_threshold: float = 3.0


# -----------------------------
# MAIN API
# -----------------------------
@app.post("/simulate")
async def simulate(req: SimRequest):
    ticker = req.ticker.upper()
    start = "2023-08-01"
    end = "2025-08-01"

    # Download data
    try:
        data = yf.download(
            ticker,
            start=start,
            end=end,
            progress=False,
            auto_adjust=True
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to download data: {e}")

    # Not enough data
    if data is None or data.shape[0] < 10:
        raise HTTPException(status_code=404, detail="Not enough data for this ticker")

    # Prepare
    prices = data["Close"]
    returns = prepare_returns(prices)

    # Estimate parameters
    params = estimate_parameters(returns, k_threshold=req.k_threshold)

    S0 = float(prices.iloc[-1])

    # Simulate
    final_prices, sample_paths = simulate_jump_diffusion(
        S0=S0,
        T=req.horizon_days,
        M=req.M,
        params=params,
        random_seed=42
    )

    # Metrics
    expected_final = float(final_prices.mean())
    median_final = float(np.median(final_prices))
    ci_lower = float(np.percentile(final_prices, 2.5))
    ci_upper = float(np.percentile(final_prices, 97.5))

    # Response
    return {
        "ticker": ticker,
        "S0": S0,
        "params": params,
        "expected_final": expected_final,
        "median_final": median_final,
        "ci95": [ci_lower, ci_upper],
        "final_prices_sample": final_prices.tolist(),
        "sample_paths": sample_paths.tolist(),
        "horizon_days": req.horizon_days,
        "M": req.M,
    }
