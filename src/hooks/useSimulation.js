import { useCallback } from 'react'
import axios from 'axios'


export default function useSimulation() {
const run = useCallback(async ({ ticker, horizon_days, M, k_threshold }, onProgress) => {
// Simple wrapper for POSTing to backend
const payload = { ticker, horizon_days, M, k_threshold }
const res = await axios.post('http://localhost:8000/simulate', payload, { timeout: 120000 })
return res.data
}, [])


return { run }
}