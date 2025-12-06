import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function Results({ res }) {
  const { sample_paths, expected_final, median_final, ci95, horizon_days } = res;

  // Format sample paths for plotting
  const formatPaths = (paths, T) => {
    const result = [];
    for (let i = 0; i <= T; i++) {
      const row = { day: i };
      for (let j = 0; j < paths.length; j++) {
        row[`p${j}`] = paths[j][i];
      }
      result.push(row);
    }
    return result;
  };

  const pathsData = formatPaths(sample_paths, horizon_days);

  // Histogram
  const finals = res.final_prices_sample;
  const nBins = 40;
  const minP = Math.min(...finals);
  const maxP = Math.max(...finals);
  const binSize = (maxP - minP) / nBins;
  const bins = Array(nBins).fill(0);

  finals.forEach((v) => {
    let idx = Math.floor(((v - minP) / (maxP - minP)) * nBins);
    if (idx < 0) idx = 0;
    if (idx >= nBins) idx = nBins - 1;
    bins[idx]++;
  });

  const histData = bins.map((count, idx) => ({
    x: minP + (idx + 0.5) * binSize,
    count,
  }));

  return (
    <div className="results">
      <div className="cards">
        <div className="card cute">
          <h3>Expected Final Price</h3>
          <div className="value">{expected_final.toFixed(2)}</div>
          <div className="sub">
            Median: {median_final.toFixed(2)} — 95% CI: {ci95[0].toFixed(2)} —{" "}
            {ci95[1].toFixed(2)}
          </div>
        </div>
      </div>

      {/* ================= PATHS CHART ================= */}
      <section className="plot-block">
        <h3>Simulated Price Paths (sample)</h3>
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <LineChart data={pathsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />

              {sample_paths.map((_, idx) => (
                <Line
                  key={idx}
                  type="monotone"
                  dataKey={`p${idx}`}
                  strokeWidth={1}
                  dot={false}
                  strokeOpacity={0.8}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ================= HISTOGRAM ================= */}
      <section className="plot-block">
        <h3>Distribution of Final Prices</h3>
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={histData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" tickFormatter={(v) => v.toFixed(0)} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ff9ecb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="ci-note">
          Expected: <b>{expected_final.toFixed(2)}</b> — 95% CI:{" "}
          <b>{ci95[0].toFixed(2)}</b> to <b>{ci95[1].toFixed(2)}</b>
        </div>
      </section>
    </div>
  );
}
