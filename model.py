import numpy as np
import pandas as pd
from scipy import stats


def prepare_returns(prices: pd.Series):
    returns = np.log(prices / prices.shift(1)).dropna()
    return returns


def estimate_parameters(returns: pd.Series, k_threshold=3.0):
    r = returns
    mu_all = r.mean()
    sigma_all = r.std(ddof=1)

    # detect jumps
    thr = k_threshold * sigma_all
    jump_mask = (r - mu_all).abs() > thr

    jumps = r[jump_mask]
    non_jumps = r[~jump_mask]

    # lambda
    lam = float(jumps.shape[0] / r.shape[0])

    # jump size parameters
    if jumps.shape[0] >= 2:
        mu_J = float(jumps.mean())
        sigma_J = float(jumps.std(ddof=1))
    elif jumps.shape[0] == 1:
        mu_J = float(jumps.iloc[0])
        sigma_J = float(sigma_all) * 0.5
    else:
        lam = 1.0 / 252.0 * 0.1
        mu_J = 0.0
        sigma_J = float(sigma_all)

    # diffusion parameters
    if non_jumps.shape[0] >= 2:
        mu = float(non_jumps.mean())
        sigma = float(non_jumps.std(ddof=1))
    else:
        mu = float(mu_all)
        sigma = float(sigma_all)

    return {
        "mu": mu,
        "sigma": sigma,
        "lambda": lam,
        "mu_J": mu_J,
        "sigma_J": sigma_J,
        "k_threshold": k_threshold,
        "n_obs": int(r.shape[0]),
    }


def simulate_jump_diffusion(S0: float, T: int, M: int, params: dict, random_seed: int = None):
    """
    Simulate M paths, each T days ahead (discrete daily model).
    Returns:
        - final_prices: array shape (M,)
        - sample_paths: array shape (n_plot, T+1)
    """
    if random_seed is not None:
        np.random.seed(random_seed)

    mu = params["mu"]
    sigma = params["sigma"]
    lam = params["lambda"]
    mu_J = params["mu_J"]
    sigma_J = params["sigma_J"]

    final_prices = np.zeros(M)
    n_plot = min(10, M)
    sample_paths = np.zeros((n_plot, T + 1))

    for i in range(M):
        S = S0

        if i < n_plot:
            sample_paths[i, 0] = S

        for t in range(1, T + 1):
            Nt = np.random.poisson(lam)

            if Nt > 0:
                J = np.sum(np.random.normal(mu_J, sigma_J, size=Nt))
            else:
                J = 0.0

            Z = np.random.normal(mu, sigma)
            X = Z + J
            S = S * np.exp(X)

            if i < n_plot:
                sample_paths[i, t] = S

        final_prices[i] = S

    return final_prices, sample_paths
