import React, { useState, useRef } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconBrain = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-3.28 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-3.28 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3z"/>
    </svg>
)

const IconCreatePlan = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
)

const IconResults = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
)

const IconUser = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
)

const IconLogout = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
)

const IconUpload = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 16 12 12 8 16"/>
        <line x1="12" y1="12" x2="12" y2="21"/>
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
)

const IconFile = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00d4d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
    </svg>
)

const IconStar = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
)

const IconFlash = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
)

const IconArrow = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"/>
        <polyline points="12 5 19 12 12 19"/>
    </svg>
)

// ── Component ─────────────────────────────────────────────────────────────────
const Home = () => {
    const { loading, generateReport, reports } = useInterview()
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [fileName, setFileName] = useState("")
    const [activeNav, setActiveNav] = useState('create')
    const resumeInputRef = useRef()
    const navigate = useNavigate()

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        setFileName(file ? file.name : "")
    }

    const handleGenerateReport = async () => {
        const resumeFile = resumeInputRef.current?.files?.[0]
        if (!jobDescription.trim()) {
            alert("Please paste the target job description.")
            return
        }
        if (!resumeFile && !selfDescription.trim()) {
            alert("Please upload your resume or write a quick self-description.")
            return
        }
        const data = await generateReport({ jobDescription, selfDescription, resumeFile })
        if (data && data._id) {
            navigate(`/interview/${data._id}`)
        } else {
            alert("Failed to generate your interview plan. Please try again.")
        }
    }

    if (loading) {
        return (
            <main className='loading-screen'>
                <div className='loading-spinner' />
                <h1>Generating Your Interview Plan...</h1>
            </main>
        )
    }

    return (
        <div className='home-app'>

            {/* ── Sidebar ── */}
            <aside className='sidebar'>
                <div className='sidebar__logo'>
                    <div className='logo-icon'>
                        <IconBrain />
                    </div>
                    <span>BrainHire</span>
                </div>

                <nav className='sidebar__nav'>
                    <button
                        id="nav-create-plan"
                        className={`sidebar__item ${activeNav === 'create' ? 'sidebar__item--active' : ''}`}
                        onClick={() => setActiveNav('create')}
                    >
                        <IconCreatePlan />
                        Create Plan
                    </button>

                    <button
                        id="nav-results"
                        className={`sidebar__item ${activeNav === 'results' ? 'sidebar__item--active' : ''}`}
                        onClick={() => { setActiveNav('results'); }}
                    >
                        <IconResults />
                        Results
                    </button>
                </nav>

                <div className='sidebar__footer'>
                    <button className='sidebar__logout' onClick={() => navigate('/')}>
                        <IconLogout />
                        Back to Home
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className='home-main'>

                {/* Hero Section */}
                <section className='hero-section'>
                    <div className='hero-section__content'>
                        <div className='hero-section__eyebrow'>
                            <span className='dot' />
                            AI-Powered Interview Coach
                        </div>
                        <h1>
                            Create Your Custom
                            <span className='highlight'>Interview Plan</span>
                        </h1>
                        <p>
                            Let our AI analyze the job requirements and your unique profile
                            to build a winning strategy.
                        </p>
                    </div>

                    {/* Abstract visual */}
                    <div className='hero-section__visual'>
                        <div className='orb-1' />
                        <div className='orb-2' />
                        <div className='orb-3' />
                        <div className='geo-lines' />
                        <div className='hand-silhouette'>
                            <svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" opacity="0.5">
                                {/* Mechanical arm silhouette */}
                                <defs>
                                    <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor="#00d4d4" stopOpacity="0.6"/>
                                        <stop offset="100%" stopColor="#00d4d4" stopOpacity="0"/>
                                    </radialGradient>
                                </defs>
                                {/* Arm segments */}
                                <rect x="30" y="120" width="60" height="16" rx="8" fill="none" stroke="#00d4d4" strokeWidth="1.5" opacity="0.5"/>
                                <rect x="85" y="115" width="50" height="14" rx="7" fill="none" stroke="#00d4d4" strokeWidth="1.5" opacity="0.5"/>
                                <rect x="130" y="110" width="40" height="12" rx="6" fill="none" stroke="#00d4d4" strokeWidth="1.5" opacity="0.5"/>
                                {/* Palm */}
                                <rect x="165" y="100" width="48" height="36" rx="8" fill="none" stroke="#00d4d4" strokeWidth="1.5" opacity="0.6"/>
                                {/* Fingers */}
                                <rect x="170" y="70" width="10" height="32" rx="5" fill="none" stroke="#00d4d4" strokeWidth="1.5" opacity="0.5"/>
                                <rect x="185" y="65" width="10" height="37" rx="5" fill="none" stroke="#00d4d4" strokeWidth="1.5" opacity="0.5"/>
                                <rect x="200" y="68" width="10" height="34" rx="5" fill="none" stroke="#00d4d4" strokeWidth="1.5" opacity="0.5"/>
                                <rect x="215" y="74" width="9" height="28" rx="4.5" fill="none" stroke="#00d4d4" strokeWidth="1.5" opacity="0.5"/>
                                {/* Thumb */}
                                <rect x="155" y="108" width="14" height="8" rx="4" fill="none" stroke="#00d4d4" strokeWidth="1.5" opacity="0.5" transform="rotate(-20, 162, 112)"/>
                                {/* Glow at fingertip */}
                                <circle cx="220" cy="66" r="18" fill="url(#glowGrad)" opacity="0.7"/>
                                <circle cx="220" cy="66" r="6" fill="#00d4d4" opacity="0.8"/>
                                {/* Human hand reaching */}
                                <path d="M 270 90 Q 285 75 295 65" stroke="rgba(200,200,200,0.4)" strokeWidth="2" fill="none" strokeLinecap="round"/>
                                <ellipse cx="278" cy="82" rx="12" ry="6" fill="rgba(200,200,200,0.15)" stroke="rgba(200,200,200,0.3)" strokeWidth="1" transform="rotate(-30, 278, 82)"/>
                            </svg>
                        </div>
                    </div>
                </section>

                {/* ── Create Plan Section ── */}
                {activeNav === 'create' && (
                    <section className='create-plan'>
                        <div className='create-plan__panels'>

                            {/* Left Panel — Job Description */}
                            <div className='dark-panel'>
                                <div className='dark-panel__header'>
                                    <div className='panel-icon'>
                                        <IconCreatePlan />
                                    </div>
                                    <h2>Target Job Description</h2>
                                    <span className='badge badge--required'>Required</span>
                                </div>
                                <textarea
                                    id="job-description-input"
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    className='dark-panel__textarea'
                                    placeholder={`Paste the full job description here. The more details you provide, the better the plan.\n\ne.g. "Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design..."`}
                                    maxLength={5000}
                                />
                                <div className='char-counter'>{jobDescription.length} / 5000 chars</div>
                            </div>

                            {/* Right Panel — Your Profile */}
                            <div className='dark-panel'>
                                <div className='dark-panel__header'>
                                    <div className='panel-icon'>
                                        <IconUser />
                                    </div>
                                    <h2>Your Profile</h2>
                                    <span className='badge badge--best'>Best Results</span>
                                </div>

                                {/* Upload Resume */}
                                <div className='upload-section'>
                                    <label className='section-label'>Upload Resume</label>
                                    <label id="resume-dropzone" className='dropzone' htmlFor='resume'>
                                        <span className='dropzone__icon'>
                                            {fileName ? <IconFile /> : <IconUpload />}
                                        </span>
                                        <p className='dropzone__title'>
                                            {fileName ? fileName : 'Click to upload or drag & drop'}
                                        </p>
                                        <p className='dropzone__subtitle'>
                                            {fileName ? 'Resume selected · Click to change' : 'PDF or DOCX (Max 5MB)'}
                                        </p>
                                        <input
                                            ref={resumeInputRef}
                                            hidden
                                            type='file'
                                            id='resume'
                                            name='resume'
                                            accept='.pdf,.docx'
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>

                                {/* OR Divider */}
                                <div className='or-divider'><span>OR</span></div>

                                {/* Quick Self-Description */}
                                <div className='self-description'>
                                    <label className='section-label' htmlFor='selfDescription'>
                                        Quick Self-Description
                                    </label>
                                    <textarea
                                        id='selfDescription'
                                        value={selfDescription}
                                        onChange={(e) => setSelfDescription(e.target.value)}
                                        className='dark-panel__textarea dark-panel__textarea--short'
                                        placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                                        maxLength={1000}
                                    />
                                    <div className='char-counter'>{selfDescription.length} / 1000 chars</div>
                                </div>
                            </div>
                        </div>

                        {/* Generate Bar */}
                        <div className='generate-bar'>
                            <span className='footer-info'>
                                <span className='flash-icon'><IconFlash /></span>
                                AI-Powered Strategy Generation &bull; Approx 30s
                            </span>
                            <button
                                id="generate-strategy-btn"
                                onClick={handleGenerateReport}
                                className='generate-btn'
                            >
                                <IconStar />
                                Generate My Interview Strategy
                                <IconArrow />
                            </button>
                        </div>
                    </section>
                )}

                {/* ── Results Section ── */}
                {activeNav === 'results' && (
                    <section className='create-plan'>
                        {reports.length > 0 ? (
                            <div className='recent-reports' style={{ padding: 0 }}>
                                <h2>My Recent Interview Plans</h2>
                                <ul className='reports-list'>
                                    {reports.map(report => (
                                        <li
                                            key={report._id}
                                            className='report-item'
                                            onClick={() => navigate(`/interview/${report._id}`)}
                                        >
                                            <h3>{report.title || 'Untitled Position'}</h3>
                                            <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                            <p className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>
                                                Match Score: {report.matchScore}%
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', color: '#556677', padding: '3rem 0' }}>
                                <p style={{ fontSize: '1rem' }}>No interview plans yet.</p>
                                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Create your first plan to see results here.</p>
                                <button
                                    onClick={() => setActiveNav('create')}
                                    className='generate-btn'
                                    style={{ marginTop: '1.5rem' }}
                                >
                                    <IconCreatePlan />
                                    Create Your First Plan
                                </button>
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    )
}

export default Home