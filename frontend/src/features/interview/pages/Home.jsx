import React, { useState, useRef } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'

/* ── SVG Icons ─────────────────────────────────────────────────────────────── */
const IcBrain = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-3.28 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-3.28 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3z"/>
  </svg>
)
const IcPlan = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
)
const IcResults = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
)
const IcUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const IcBack = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const IcUpload = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
)
const IcFile = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#00d4d4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)
const IcFlash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)
const IcStar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
)
const IcArrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

/* ── Robot hand SVG (right-side hero visual) ────────────────────────────────── */
const RobotHandVisual = () => (
  <svg viewBox="0 0 520 260" xmlns="http://www.w3.org/2000/svg" className="hv-canvas">
    <defs>
      <radialGradient id="tipGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#00d4d4" stopOpacity="0.9"/>
        <stop offset="100%" stopColor="#00d4d4" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id="handGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#00d4d4" stopOpacity="0.12"/>
        <stop offset="100%" stopColor="#00d4d4" stopOpacity="0"/>
      </radialGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    {/* Arm body segments */}
    <rect x="10" y="118" width="80" height="22" rx="11" fill="none" stroke="#1a3040" strokeWidth="1.5"/>
    <rect x="10" y="118" width="80" height="22" rx="11" fill="none" stroke="#00d4d4" strokeWidth="0.6" opacity="0.4"/>
    {/* joint rings */}
    <circle cx="90" cy="129" r="11" fill="#0d1820" stroke="#00d4d4" strokeWidth="0.7" opacity="0.5"/>
    <rect x="98" y="120" width="68" height="20" rx="10" fill="none" stroke="#1a3040" strokeWidth="1.5"/>
    <rect x="98" y="120" width="68" height="20" rx="10" fill="none" stroke="#00d4d4" strokeWidth="0.5" opacity="0.3"/>
    <circle cx="165" cy="130" r="10" fill="#0d1820" stroke="#00d4d4" strokeWidth="0.7" opacity="0.5"/>
    <rect x="172" y="122" width="55" height="18" rx="9" fill="none" stroke="#1a3040" strokeWidth="1.5"/>
    <rect x="172" y="122" width="55" height="18" rx="9" fill="none" stroke="#00d4d4" strokeWidth="0.5" opacity="0.3"/>

    {/* Palm */}
    <rect x="222" y="108" width="64" height="46" rx="10" fill="#0d1a26" stroke="#1a3040" strokeWidth="2"/>
    <rect x="222" y="108" width="64" height="46" rx="10" fill="none" stroke="#00d4d4" strokeWidth="0.8" opacity="0.5"/>
    {/* palm detail lines */}
    <line x1="235" y1="116" x2="275" y2="116" stroke="#00d4d4" strokeWidth="0.4" opacity="0.3"/>
    <line x1="235" y1="122" x2="272" y2="122" stroke="#00d4d4" strokeWidth="0.4" opacity="0.2"/>

    {/* Fingers */}
    <rect x="228" y="76" width="13" height="34" rx="6.5" fill="#0d1a26" stroke="#00d4d4" strokeWidth="0.8" opacity="0.6"/>
    <rect x="245" y="70" width="13" height="40" rx="6.5" fill="#0d1a26" stroke="#00d4d4" strokeWidth="0.8" opacity="0.6"/>
    <rect x="262" y="73" width="13" height="37" rx="6.5" fill="#0d1a26" stroke="#00d4d4" strokeWidth="0.8" opacity="0.6"/>
    <rect x="279" y="80" width="12" height="30" rx="6" fill="#0d1a26" stroke="#00d4d4" strokeWidth="0.7" opacity="0.5"/>
    {/* Thumb */}
    <rect x="210" y="120" width="15" height="10" rx="5" fill="#0d1a26" stroke="#00d4d4" strokeWidth="0.7" opacity="0.5" transform="rotate(-25 217 125)"/>

    {/* Fingertip joints */}
    <circle cx="234" cy="78" r="3.5" fill="#0d1a26" stroke="#00d4d4" strokeWidth="0.7" opacity="0.6"/>
    <circle cx="251" cy="72" r="3.5" fill="#0d1a26" stroke="#00d4d4" strokeWidth="0.7" opacity="0.6"/>
    <circle cx="268" cy="75" r="3.5" fill="#0d1a26" stroke="#00d4d4" strokeWidth="0.7" opacity="0.6"/>

    {/* ENERGY glow on index fingertip */}
    <circle cx="251" cy="66" r="26" fill="url(#tipGlow)" opacity="0.8"/>
    <circle cx="251" cy="66" r="14" fill="url(#tipGlow)" opacity="0.7"/>
    <circle cx="251" cy="66" r="6" fill="#00d4d4" opacity="0.9" filter="url(#glow)"/>
    <circle cx="251" cy="66" r="3" fill="#ffffff" opacity="0.95"/>

    {/* energy sparks */}
    <line x1="251" y1="60" x2="248" y2="53" stroke="#00d4d4" strokeWidth="1" opacity="0.7" strokeLinecap="round"/>
    <line x1="258" y1="63" x2="264" y2="58" stroke="#00d4d4" strokeWidth="1" opacity="0.6" strokeLinecap="round"/>
    <line x1="244" y1="63" x2="238" y2="59" stroke="#00d4d4" strokeWidth="1" opacity="0.5" strokeLinecap="round"/>
    <line x1="253" y1="58" x2="257" y2="50" stroke="#00ffff" strokeWidth="0.7" opacity="0.5" strokeLinecap="round"/>

    {/* Human hand (right, reaching from right edge) */}
    <g opacity="0.55">
      {/* palm */}
      <ellipse cx="420" cy="130" rx="35" ry="22" fill="rgba(200,180,160,0.12)" stroke="rgba(200,180,160,0.3)" strokeWidth="1"/>
      {/* fingers */}
      <path d="M 398 115 Q 392 95 388 80" fill="none" stroke="rgba(200,180,160,0.35)" strokeWidth="5" strokeLinecap="round"/>
      <path d="M 410 110 Q 406 88 403 72" fill="none" stroke="rgba(200,180,160,0.35)" strokeWidth="5" strokeLinecap="round"/>
      <path d="M 422 110 Q 420 88 419 72" fill="none" stroke="rgba(200,180,160,0.3)" strokeWidth="5" strokeLinecap="round"/>
      <path d="M 434 112 Q 435 92 437 78" fill="none" stroke="rgba(200,180,160,0.28)" strokeWidth="5" strokeLinecap="round"/>
      {/* thumb */}
      <path d="M 385 128 Q 372 118 365 108" fill="none" stroke="rgba(200,180,160,0.3)" strokeWidth="5.5" strokeLinecap="round"/>
      {/* arm extending right */}
      <rect x="430" y="118" width="90" height="24" rx="12" fill="rgba(180,160,140,0.08)" stroke="rgba(200,180,160,0.2)" strokeWidth="1"/>
    </g>

    {/* Connection spark between the two hands */}
    <circle cx="330" cy="80" r="2" fill="#00d4d4" opacity="0.6"/>
    <circle cx="350" cy="90" r="1.5" fill="#00ffff" opacity="0.5"/>
    <circle cx="370" cy="78" r="1" fill="#00d4d4" opacity="0.4"/>

    {/* Ambient glow around whole scene */}
    <circle cx="260" cy="130" r="140" fill="url(#handGlow)"/>
  </svg>
)

/* ── Main Component ──────────────────────────────────────────────────────────── */
const Home = () => {
  const { loading, generateReport, reports } = useInterview()
  const [jobDesc, setJobDesc] = useState('')
  const [selfDesc, setSelfDesc] = useState('')
  const [fileName, setFileName] = useState('')
  const [activeTab, setActiveTab] = useState('create')
  const resumeRef = useRef()
  const navigate = useNavigate()

  const handleFile = (e) => setFileName(e.target.files[0]?.name || '')

  const handleGenerate = async () => {
    const resumeFile = resumeRef.current?.files?.[0]
    if (!jobDesc.trim()) return alert('Please paste the target job description.')
    if (!resumeFile && !selfDesc.trim()) return alert('Please upload your resume or write a self-description.')
    const data = await generateReport({ jobDescription: jobDesc, selfDescription: selfDesc, resumeFile })
    if (data?._id) navigate(`/interview/${data._id}`)
    else alert('Failed to generate your interview plan. Please try again.')
  }

  if (loading) {
    return (
      <main className="loading-screen">
        <div className="ls-ring"/>
        <h1>Generating Your Interview Plan...</h1>
      </main>
    )
  }

  return (
    <div className="home-app">

      {/* ── Sidebar ── */}
      <aside className="hs">
        <div className="hs__logo">
          <div className="hs__logo-icon"><IcBrain/></div>
          <span>BrainHire</span>
        </div>

        <nav className="hs__nav">
          <button
            id="nav-create"
            className={`hs__item${activeTab === 'create' ? ' hs__item--active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <IcPlan/> Create Plan
          </button>
          <button
            id="nav-results"
            className={`hs__item${activeTab === 'results' ? ' hs__item--active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            <IcResults/> Results
          </button>
        </nav>

        <div className="hs__bottom">
          <button className="hs__back" onClick={() => navigate('/')}>
            <IcBack/> Back to Home
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="hm">

        {/* Header with robot hand visual */}
        <div className="hm__header">
          <div className="hm__header-content">
            <h1>
              Create Your Custom
              <span className="cyan-line">Interview Plan</span>
            </h1>
            <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
          </div>
          <div className="hm__header-visual">
            <RobotHandVisual/>
          </div>
        </div>

        {/* Body */}
        <div className="hm__body">

          {/* ── Create Plan Tab ── */}
          {activeTab === 'create' && (
            <>
              <div className="panels-row">

                {/* Left — Job Description */}
                <div className="dc">
                  <div className="dc__head">
                    <div className="dc__icon"><IcPlan/></div>
                    <span className="dc__title">Target Job Description</span>
                    <span className="badge badge--req">Required</span>
                  </div>
                  <textarea
                    id="job-desc"
                    className="dc__ta"
                    value={jobDesc}
                    onChange={e => setJobDesc(e.target.value)}
                    maxLength={5000}
                    placeholder={`Paste the full job description here. The more details you provide, the better the plan.\n\ne.g. "Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design..."`}
                  />
                  <div className="dc__counter">{jobDesc.length} / 5000 chars</div>
                </div>

                {/* Right — Your Profile */}
                <div className="dc">
                  <div className="dc__head">
                    <div className="dc__icon"><IcUser/></div>
                    <span className="dc__title">Your Profile</span>
                    <span className="badge badge--best">👑 Best Results</span>
                  </div>

                  {/* Upload */}
                  <div className="uz">
                    <div className="uz__label">Upload Resume</div>
                    <label id="resume-drop" className="uz__drop" htmlFor="resume-file">
                      <span className="uz__icon">
                        {fileName ? <IcFile/> : <IcUpload/>}
                      </span>
                      <span className="uz__t1">{fileName || 'Click to upload or drag & drop'}</span>
                      <span className="uz__t2">{fileName ? 'Resume selected · Click to change' : 'PDF or DOCX (Max 5MB)'}</span>
                      <input
                        ref={resumeRef}
                        hidden type="file" id="resume-file"
                        accept=".pdf,.docx"
                        onChange={handleFile}
                      />
                    </label>
                  </div>

                  <div className="or-div"><span>OR</span></div>

                  {/* Self description */}
                  <div className="sd">
                    <div className="sd__label">Quick Self-Description</div>
                    <textarea
                      id="self-desc"
                      className="dc__ta dc__ta--sm"
                      value={selfDesc}
                      onChange={e => setSelfDesc(e.target.value)}
                      maxLength={1000}
                      placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                    />
                    <div className="dc__counter">{selfDesc.length} / 1000 chars</div>
                  </div>
                </div>

              </div>

              {/* Generate bar */}
              <div className="gen-bar">
                <div className="gen-bar__info">
                  <span className="flash"><IcFlash/></span>
                  AI-Powered Strategy Generation &bull; Approx 30s
                </div>
                <button id="generate-btn" className="gen-btn" onClick={handleGenerate}>
                  <IcStar/>
                  Generate My Interview Strategy
                  <IcArrow/>
                </button>
              </div>
            </>
          )}

          {/* ── Results Tab ── */}
          {activeTab === 'results' && (
            reports.length > 0 ? (
              <ul className="reports-grid">
                {reports.map(r => (
                  <li key={r._id} className="ri" onClick={() => navigate(`/interview/${r._id}`)}>
                    <h3>{r.title || 'Untitled Position'}</h3>
                    <p className="ri__meta">Generated on {new Date(r.createdAt).toLocaleDateString()}</p>
                    <p className={`score score--${r.matchScore >= 80 ? 'high' : r.matchScore >= 60 ? 'mid' : 'low'}`}>
                      Match Score: {r.matchScore}%
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="results-empty">
                <p>No interview plans yet.</p>
                <p style={{fontSize:'0.8rem', marginTop:'0.25rem'}}>Create your first plan to see results here.</p>
                <button className="gen-btn" onClick={() => setActiveTab('create')}>
                  <IcPlan/> Create Your First Plan
                </button>
              </div>
            )
          )}

        </div>
      </main>
    </div>
  )
}

export default Home