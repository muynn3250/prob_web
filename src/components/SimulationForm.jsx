import React, { useState } from 'react'
import useSimulation from '../hooks/useSimulation'


export default function SimulationForm({ onStart = () => {}, onComplete = () => {} }) {
const [ticker, setTicker] = useState('AAPL')
const [horizon, setHorizon] = useState(30)
const [M, setM] = useState(5000)
const [k, setK] = useState(3.0)
const [error, setError] = useState(null)


const { run } = useSimulation()


const handleSubmit = async (e) => {
e.preventDefault()
setError(null)
onStart(async () => {
try {
const data = await run({ ticker, horizon_days: Number(horizon), M: Number(M), k_threshold: Number(k) })
onComplete(data)
} catch (err) {
setError(err.message || 'Unknown error')
}
})
}


return (
<form className="sim-form" onSubmit={handleSubmit}>
<div className="form-row">
<label>Ticker</label>
<input value={ticker} onChange={(e) => setTicker(e.target.value)} />
</div>
<div className="form-row">
<label>Horizon (days)</label>
<input type="number" value={horizon} onChange={(e) => setHorizon(e.target.value)} />
</div>
<div className="form-row">
<label>Simulations (M)</label>
<input type="number" value={M} onChange={(e) => setM(e.target.value)} />
</div>
<div className="form-row">
<label>Jump threshold (k * sigma)</label>
<input type="number" step="0.1" value={k} onChange={(e) => setK(e.target.value)} />
</div>


<div className="actions">
<button className="btn">Run Simulation</button>
</div>


{error && <div className="error">{error}</div>}
</form>
)
}