import React from 'react'
import '../auth.form.scss'

const AuthLoading = () => (
  <main className="auth-loading" aria-live="polite" aria-label="Loading BrainHire">
    <div className="auth-loading__grid" />
    <div className="auth-loading__glow" />
    <div className="auth-loading__content">
      <div className="auth-loading__brand">
        <span className="auth-loading__dot" />
        <span>BrainHire</span>
      </div>
      <div className="auth-loading__reveal" aria-hidden="true">
        <span className="auth-loading__word auth-loading__word--loading">Loading...</span>
        <span className="auth-loading__word auth-loading__word--ready">Ready</span>
      </div>
      <div className="auth-loading__track">
        <span />
      </div>
    </div>
  </main>
)

export default AuthLoading
