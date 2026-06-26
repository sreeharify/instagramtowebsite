import { useEffect, useRef } from 'react'

export default function LoadingScreen({ total, loaded, visible, onDone }) {
  const timerRef = useRef(null)
  const doneFired = useRef(false)

  const progress = total > 0 ? Math.round((loaded / total) * 100) : 0

  useEffect(() => {
    if (!visible) return
    doneFired.current = false
    // Max wait: 20 seconds, then force reveal
    timerRef.current = setTimeout(() => {
      if (!doneFired.current) {
        doneFired.current = true
        onDone()
      }
    }, 20000)
    return () => clearTimeout(timerRef.current)
  }, [visible])

  useEffect(() => {
    if (loaded >= total && total > 0 && visible && !doneFired.current) {
      // Small delay so last image visually registers
      setTimeout(() => {
        if (!doneFired.current) {
          doneFired.current = true
          clearTimeout(timerRef.current)
          onDone()
        }
      }, 600)
    }
  }, [loaded, total, visible])

  if (!visible) return null

  return (
    <div className="loading-screen" id="loading-screen">
      <div className="grain-overlay" />
      <div className="loading-content">
        <div className="loading-logo">✦</div>
        <h2 className="loading-title">Crafting Your Story</h2>
        <p className="loading-sub">Weaving {total} moments into memories...</p>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="progress-label">{progress}%</div>

        <div className="loading-tagline">Every frame tells a love story.</div>
      </div>
    </div>
  )
}
