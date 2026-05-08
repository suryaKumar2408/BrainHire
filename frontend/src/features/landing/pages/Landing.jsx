import React, { useState, useEffect, useRef } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import '../style/landing.scss'

// Animated counter hook
const useCounter = (target, duration = 2000, start = false) => {
    const [count, setCount] = useState(0)
    useEffect(() => {
        if (!start) return
        let startTime = null
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
    }, [target, duration, start])
    return count
}

// Intersection observer hook
const useInView = (threshold = 0.2) => {
    const ref = useRef(null)
    const [inView, setInView] = useState(false)
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setInView(true) },
            { threshold }
        )
        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [threshold])
    return [ref, inView]
}

const StatCard = ({ value, suffix, label, start }) => {
    const count = useCounter(value, 2000, start)
    return (
        <div className="stat-card">
            <span className="stat-value">{count}{suffix}</span>
            <span className="stat-label">{label}</span>
        </div>
    )
}

const Landing = () => {
    const { user, initializing } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [statsRef, statsInView] = useInView(0.3)
    const [featuresRef, featuresInView] = useInView(0.1)
    const [howRef, howInView] = useInView(0.1)

    // Redirect logged-in users straight to dashboard
    if (!initializing && user) {
        return <Navigate to="/dashboard" replace />
    }

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const features = [
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                </svg>
            ),
            badge: 'AI-Powered',
            title: 'Smart Question Generation',
            desc: 'Our AI analyzes the job description and your resume to craft targeted, role-specific interview questions.',
            size: 'large',
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
            ),
            badge: 'Real-Time',
            title: 'Match Score Analysis',
            desc: 'Get an instant compatibility score showing how well you align with the role.',
            size: 'medium',
            visual: 'score',
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
            ),
            badge: 'PDF Export',
            title: 'Resume PDF Builder',
            desc: 'Generate a polished, ATS-friendly resume PDF with a single click.',
            size: 'medium',
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
            ),
            badge: 'Secure',
            title: 'Safe & Confidential',
            desc: 'Your resume data is processed securely and never stored beyond your session.',
            size: 'medium',
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
            ),
            badge: 'Multi-Role',
            title: 'Unlimited Interview Plans',
            desc: 'Create tailored interview strategies for every role you apply to.',
            size: 'large',
        },
    ]

    const steps = [
        {
            number: '01',
            title: 'Upload Your Resume',
            desc: 'Drop your PDF or DOCX resume, or quickly describe your background in a few sentences.',
        },
        {
            number: '02',
            title: 'Paste the Job Description',
            desc: 'Copy-paste the full job listing. Our AI dissects every requirement to find the perfect match.',
        },
        {
            number: '03',
            title: 'Get Your Strategy',
            desc: 'In under 30 seconds, receive a personalized interview plan with questions, tips, and a match score.',
        },
    ]

    const logos = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Stripe', 'Airbnb']

    return (
        <div className="landing">
            {/* ── Navbar ── */}
            <nav className={`landing-nav ${scrolled ? 'landing-nav--scrolled' : ''}`}>
                <div className="landing-nav__inner">
                    <a href="#" className="landing-nav__logo">
                        <span className="logo-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                            </svg>
                        </span>
                        BrainHire
                    </a>

                    <ul className="landing-nav__links">
                        <li><a href="#features">Features</a></li>
                        <li><a href="#how-it-works">How it Works</a></li>
                        <li><a href="#stats">Results</a></li>
                    </ul>

                    <div className="landing-nav__actions">
                        <Link to="/login" className="nav-btn nav-btn--ghost">Log In</Link>
                        <Link to="/register" className="nav-btn nav-btn--primary">Get Started</Link>
                    </div>

                    <button
                        className={`hamburger ${menuOpen ? 'hamburger--open' : ''}`}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span /><span /><span />
                    </button>
                </div>

                {/* Mobile menu */}
                <div className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`}>
                    <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
                    <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it Works</a>
                    <a href="#stats" onClick={() => setMenuOpen(false)}>Results</a>
                    <Link to="/login" onClick={() => setMenuOpen(false)}>Log In</Link>
                    <Link to="/register" className="mobile-cta" onClick={() => setMenuOpen(false)}>Get Started Free</Link>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="hero">
                <div className="hero__bg">
                    <div className="hero__orb hero__orb--1" />
                    <div className="hero__orb hero__orb--2" />
                    <div className="hero__grid" />
                </div>

                <div className="hero__content">
                    <div className="hero__text">
                        <div className="hero__badge">
                            <span className="badge-dot" />
                            AI-Powered Interview Prep
                        </div>
                        <h1 className="hero__headline">
                            Prepare Smarter,<br />
                            <span className="hero__headline--accent">Land Your Dream Job</span>
                        </h1>
                        <p className="hero__sub">
                            Upload your resume, paste the job description, and let our AI craft a personalized interview strategy — complete with targeted questions and your match score.
                        </p>
                        <div className="hero__actions">
                            <Link to="/register" className="btn-hero btn-hero--primary" id="hero-cta">
                                Start For Free
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </Link>
                            <a href="#how-it-works" className="btn-hero btn-hero--ghost">
                                See How It Works
                            </a>
                        </div>

                    </div>

                    <div className="hero__visual">
                        <div className="mockup-wrapper">
                            <img
                                src="/dashboard-mockup.png"
                                alt="BrainHire Interview Dashboard"
                                className="mockup-img"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Trusted by logos ── */}
            <section className="logos-strip">
                <p className="logos-strip__label">Candidates preparing for roles at</p>
                <div className="logos-strip__track">
                    <div className="logos-strip__inner">
                        {[...logos, ...logos].map((name, i) => (
                            <span key={i} className="logo-pill">{name}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features (Bento Grid) ── */}
            <section className="features" id="features" ref={featuresRef}>
                <div className="section-header">
                    <div className="section-tag">Features</div>
                    <h2 className="section-title">
                        Everything You Need to<br />
                        <span className="gradient-text">Ace Your Interview</span>
                    </h2>
                    <p className="section-sub">Smart tools that understand your profile and the role — so you walk in confident.</p>
                </div>

                <div className={`bento-grid ${featuresInView ? 'bento-grid--visible' : ''}`}>
                    {/* Large card 1 */}
                    <div className="bento-card bento-card--large bento-card--accent">
                        <div className="bento-card__tag">AI-Powered</div>
                        <h3 className="bento-card__title">Smart Question Generation</h3>
                        <p className="bento-card__desc">Our AI analyzes the job description and your resume to craft targeted, role-specific interview questions you actually need to prepare.</p>
                        <div className="bento-card__visual bento-card__visual--questions">
                            <div className="q-item q-item--active">Tell me about a time you led a cross-functional team...</div>
                            <div className="q-item">How do you prioritize competing deadlines?</div>
                            <div className="q-item">Describe your experience with React & TypeScript...</div>
                        </div>
                    </div>

                    {/* Score card */}
                    <div className="bento-card bento-card--medium">
                        <div className="bento-card__tag">Real-Time</div>
                        <h3 className="bento-card__title">Match Score Analysis</h3>
                        <p className="bento-card__desc">Get an instant compatibility score showing how well you align with the role.</p>
                        <div className="bento-card__visual bento-card__visual--ring">
                            <div className="ring-chart">
                                <svg viewBox="0 0 80 80" className="ring-svg">
                                    <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(59,110,245,0.12)" strokeWidth="8"/>
                                    <circle cx="40" cy="40" r="32" fill="none" stroke="url(#ringGrad)" strokeWidth="8" strokeDasharray="201" strokeDashoffset="52" strokeLinecap="round" transform="rotate(-90 40 40)"/>
                                    <defs>
                                        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#3b6ef5"/>
                                            <stop offset="100%" stopColor="#6690fa"/>
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="ring-label">87%</div>
                            </div>
                            <div className="ring-meta">High Match</div>
                        </div>
                    </div>

                    {/* PDF card */}
                    <div className="bento-card bento-card--medium">
                        <div className="bento-card__tag">PDF Export</div>
                        <h3 className="bento-card__title">Resume PDF Builder</h3>
                        <p className="bento-card__desc">Generate a polished, ATS-friendly resume PDF tailored to the role.</p>
                        <div className="bento-card__visual bento-card__visual--pdf">
                            <div className="pdf-preview">
                                <div className="pdf-line pdf-line--title" />
                                <div className="pdf-line" />
                                <div className="pdf-line pdf-line--short" />
                                <div className="pdf-line" />
                                <div className="pdf-line pdf-line--short" />
                            </div>
                            <div className="pdf-badge">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                Download PDF
                            </div>
                        </div>
                    </div>

                    {/* Security card */}
                    <div className="bento-card bento-card--small">
                        <div className="bento-card__tag">Secure</div>
                        <h3 className="bento-card__title">Safe & Confidential</h3>
                        <p className="bento-card__desc">Your data is processed securely and never stored beyond your session.</p>
                        <div className="lock-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        </div>
                    </div>

                    {/* Plans card */}
                    <div className="bento-card bento-card--medium bento-card--dark">
                        <div className="bento-card__tag">Unlimited</div>
                        <h3 className="bento-card__title">Multiple Interview Plans</h3>
                        <p className="bento-card__desc">Create tailored strategies for every role you apply to, all in one place.</p>
                        <div className="plans-stack">
                            <div className="plan-chip">🎯 Sr. Frontend Engineer @ Google</div>
                            <div className="plan-chip">🏢 Product Manager @ Stripe</div>
                            <div className="plan-chip">⚡ ML Engineer @ Meta</div>
                        </div>
                    </div>

                    {/* Speed card */}
                    <div className="bento-card bento-card--small bento-card--glow">
                        <div className="bento-card__tag">Fast</div>
                        <h3 className="bento-card__title">Ready in 30s</h3>
                        <p className="bento-card__desc">Full interview plan generated in under 30 seconds.</p>
                        <div className="speed-badge">⚡ 30s</div>
                    </div>
                </div>
            </section>

            {/* ── How It Works ── */}
            <section className="how-it-works" id="how-it-works" ref={howRef}>
                <div className="section-header">
                    <div className="section-tag">Process</div>
                    <h2 className="section-title">
                        Three Steps to<br />
                        <span className="gradient-text">Interview Success</span>
                    </h2>
                </div>

                <div className={`steps-grid ${howInView ? 'steps-grid--visible' : ''}`}>
                    {steps.map((step, i) => (
                        <div key={i} className="step-card" style={{ '--delay': `${i * 0.15}s` }}>
                            <div className="step-card__number">{step.number}</div>
                            <h3 className="step-card__title">{step.title}</h3>
                            <p className="step-card__desc">{step.desc}</p>
                            {i < steps.length - 1 && <div className="step-connector" />}
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="stats-section" id="stats" ref={statsRef}>
                <div className="stats-section__inner">
                    <h2 className="stats-title">
                        Trusted by candidates<br />
                        <span className="gradient-text">worldwide</span>
                    </h2>
                    <div className="stats-grid">
                        <StatCard value={2400} suffix="+" label="Plans Generated" start={statsInView} />
                        <StatCard value={87} suffix="%" label="Avg. Match Score" start={statsInView} />
                        <StatCard value={30} suffix="s" label="Avg. Generation Time" start={statsInView} />
                        <StatCard value={94} suffix="%" label="User Satisfaction" start={statsInView} />
                    </div>
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="cta-banner">
                <div className="cta-banner__orb" />
                <div className="cta-banner__content">
                    <h2 className="cta-banner__title">Ready to Ace Your Next Interview?</h2>
                    <p className="cta-banner__sub">Join thousands of candidates who landed their dream roles using BrainHire.</p>
                    <Link to="/register" className="btn-hero btn-hero--primary btn-hero--lg" id="footer-cta">
                        Get Started — It's Free
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="landing-footer">
                <div className="landing-footer__inner">
                    <div className="footer-brand">
                        <a href="#" className="landing-nav__logo">
                            <span className="logo-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                                </svg>
                            </span>
                            BrainHire
                        </a>
                        <p className="footer-brand__desc">AI-powered interview preparation platform for modern job seekers.</p>
                    </div>
                    <div className="footer-links">
                        <div className="footer-col">
                            <h4>Product</h4>
                            <a href="#features">Features</a>
                            <a href="#how-it-works">How It Works</a>
                            <Link to="/login">Dashboard</Link>
                        </div>
                        <div className="footer-col">
                            <h4>Account</h4>
                            <Link to="/login">Log In</Link>
                            <Link to="/register">Register</Link>
                        </div>
                        <div className="footer-col">
                            <h4>Legal</h4>
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                        </div>
                    </div>
                </div>
                <div className="landing-footer__bottom">
                    <p>© {new Date().getFullYear()} BrainHire. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}

export default Landing
