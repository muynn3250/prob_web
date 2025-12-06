import React, { useState } from 'react'
import SimulationForm from './components/SimulationForm'
import Results from './components/Results'
import './index.css'


export default function App() {
const [result, setResult] = useState(null)
const [loading, setLoading] = useState(false)


return (
<div className="app-root">
<header className="app-header">
<h1 className="title">Jump-Diffusion Simulator 🐰✨</h1>
<p className="subtitle">Mai Anh Mai Uyên Mai stock jump thì thành tỷ Phú</p>
</header>


<main className="main">
<SimulationForm onStart={(p) => { setLoading(true); setResult(null); p().finally(() => setLoading(false)) }} onComplete={(res) => setResult(res)} />


{loading && <div className="loading">Running simulations... please wait 🐣</div>}


{result && <Results res={result} />}
</main>


<footer className="footer">For educational purposes only. Your money, your risk.💸</footer>
</div>
)
}