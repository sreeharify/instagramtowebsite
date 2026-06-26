import { useState } from 'react'

export default function InputPage({ onGenerate, error }) {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const clean = username.trim().replace(/^@/, '')
    if (!clean) return
    setLoading(true)
    await onGenerate(clean)
    setLoading(false)
  }

  return (
    <div className="input-page">
      <div className="grain-overlay" />
      <div className="input-content">
        <div className="brand-badge">✦ Wedding Photography</div>
        <h1 className="input-title">
          Turn Your Instagram
          <span className="title-accent"> Into Art</span>
        </h1>
        <p className="input-subtitle">
          Enter an Instagram username to instantly generate a cinematic wedding photography showcase
        </p>

        <form className="input-form" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <span className="input-at">@</span>
            <input
              id="username-input"
              type="text"
              className="username-input"
              placeholder="photographerhandle"
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={loading}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <button
            type="submit"
            className={`generate-btn ${loading ? 'loading' : ''}`}
            disabled={loading || !username.trim()}
            id="generate-btn"
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Fetching...
              </span>
            ) : (
              <>Generate Website <span className="btn-arrow">→</span></>
            )}
          </button>
        </form>

        {error && (
          <div className="error-card" id="error-message">
            <span className="error-icon">⚠</span> {error}
          </div>
        )}

        <div className="input-footnote">
          Works with any public Instagram account · No login required
        </div>
      </div>

      <div className="input-deco">
        <div className="deco-ring deco-ring-1" />
        <div className="deco-ring deco-ring-2" />
        <div className="deco-ring deco-ring-3" />
      </div>
    </div>
  )
}
