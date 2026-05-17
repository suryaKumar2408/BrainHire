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
    const [howRef, howInView] = useInView(0.1)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    if (!initializing && user) {
        return <Navigate to="/dashboard" replace />
    }

    const logos = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Stripe', 'Airbnb']

    const steps = [
        { number: '01', title: 'Upload Your Resume', desc: 'Drop your PDF or DOCX resume, or quickly describe your background in a few sentences.' },
        { number: '02', title: 'Paste the Job Description', desc: 'Copy-paste the full job listing. Our AI dissects every requirement to find the perfect match.' },
        { number: '03', title: 'Get Your Strategy', desc: 'In under 30 seconds, receive a personalized interview plan with questions, tips, and a match score.' },
    ]

    return (
        <div className="landing">

            {/* ── Navbar ── */}
            <nav className={`landing-nav ${scrolled ? 'landing-nav--scrolled' : ''}`}>
                <div className="landing-nav__inner">
                    <a href="#" className="landing-nav__logo">
                        <span className="logo-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                            </svg>
                        </span>
                        BrainHire
                    </a>

                    <ul className="landing-nav__links">
                        <li><a href="#features">Features</a></li>
                        <li><a href="#how-it-works">Process</a></li>
                        <li><a href="#stats">Results</a></li>
                    </ul>

                    <div className="landing-nav__actions">
                        <Link to="/login" className="nav-btn nav-btn--ghost">Log In</Link>
                        <Link to="/register" className="nav-btn nav-btn--primary">Register</Link>
                    </div>

                    <button
                        className={`hamburger ${menuOpen ? 'hamburger--open' : ''}`}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span /><span /><span />
                    </button>
                </div>

                <div className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`}>
                    <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
                    <a href="#how-it-works" onClick={() => setMenuOpen(false)}>Process</a>
                    <a href="#stats" onClick={() => setMenuOpen(false)}>Results</a>
                    <Link to="/login" onClick={() => setMenuOpen(false)}>Log In</Link>
                    <Link to="/register" className="mobile-cta" onClick={() => setMenuOpen(false)}>Get Started Free</Link>
                </div>
            </nav>

            {/* ── Hero (centered, like reference) ── */}
            <section className="hero">
                

                {/* Centered headline */}
                <h1 className="hero__headline">
                    Interview prep that works<br />
                    like an <span className="hero__headline--accent">AI Coach</span>
                </h1>

                <p className="hero__sub">
                    Upload your resume, paste the job description, and let our AI craft a personalized
                    interview strategy — complete with targeted questions and your match score.
                </p>

                {/* Single CTA */}
                <div className="hero__actions">
                    <Link to="/register" className="btn-hero btn-hero--primary" id="hero-cta">
                        Start For Free
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </Link>
                </div>

                {/* ── 3 Feature Preview Cards (reference-style) ── */}
                <div className="hero__cards" id="features">

                    {/* Card 1 */}
                    <div className="preview-card">
                        <div className="preview-card__visual">
                            <div className="pv-ui-bar">
                                <span className="pv-dot pv-dot--r" /><span className="pv-dot pv-dot--y" /><span className="pv-dot pv-dot--g" />
                            </div>
                            <div className="pv-upload-zone">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                                <p className="pv-upload-text">Drop your resume here</p>
                                <p className="pv-upload-sub">PDF or DOCX</p>
                            </div>
                            <div className="pv-action-btn">Start Interview Prep →</div>
                        </div>
                        <div className="preview-card__body">
                            <span className="preview-card__label">WE MAKE IT EASY</span>
                            <h3>Upload. Paste. <br/>Your plan is live.</h3>
                            <p>No setup needed. Just your resume and the job description.</p>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="preview-card preview-card--elevated">
                        <div className="preview-card__visual">
                            <div className="pv-ui-bar">
                                <span className="pv-dot pv-dot--r" /><span className="pv-dot pv-dot--y" /><span className="pv-dot pv-dot--g" />
                            </div>
                            <div className="pv-chat">
                                <div className="pv-chat-row pv-chat-row--ai">
                                    <div className="pv-avatar">AI</div>
                                    <div className="pv-bubble">Tell me about your experience with system design at scale...</div>
                                </div>
                                <div className="pv-tag-row">
                                    <span className="pv-score-pill">Match Score</span>
                                    <span className="pv-score-val">87%</span>
                                </div>
                                <div className="pv-chat-row pv-chat-row--user">
                                    <div className="pv-bubble pv-bubble--user">Here's my background in distributed systems...</div>
                                </div>
                            </div>
                        </div>
                        <div className="preview-card__body">
                            <span className="preview-card__label">WE LISTEN TO YOU</span>
                            <h3>Just like we did with <strong>1000+ roles</strong></h3>
                            <p>Tailored questions based on your exact profile and the target role.</p>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="preview-card">
                        <div className="preview-card__visual">
                            <div className="pv-ui-bar">
                                <span className="pv-dot pv-dot--r" /><span className="pv-dot pv-dot--y" /><span className="pv-dot pv-dot--g" />
                            </div>
                            <div className="pv-chart-area">
                                <div className="pv-chart">
                                    <div className="pv-bar-wrap"><div className="pv-bar" style={{height:'45%'}} /></div>
                                    <div className="pv-bar-wrap"><div className="pv-bar" style={{height:'60%'}} /></div>
                                    <div className="pv-bar-wrap"><div className="pv-bar pv-bar--accent" style={{height:'85%'}} /></div>
                                    <div className="pv-bar-wrap"><div className="pv-bar" style={{height:'50%'}} /></div>
                                </div>
                                <div className="pv-dashed-line" />
                            </div>
                        </div>
                        <div className="preview-card__body">
                            <span className="preview-card__label">WE GIVE YOU TOOLS</span>
                            <h3>So you know <em>what's working</em><br/>and what needs work.</h3>
                            <p>Match scores, skill gaps, and a full preparation roadmap.</p>
                        </div>
                    </div>

                </div>
            </section>

            {/* ── Testimonial ── */}
            <section className="testimonial">
                <div className="testimonial__avatar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#37b3aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <h3 className="testimonial__title">Quick and Easy Setup</h3>
                <blockquote className="testimonial__quote">
                    "We've gone through hundreds of interview cycles — BrainHire is the only prep tool that actually understands our job descriptions and gives questions that matter."
                </blockquote>
                <p className="testimonial__attr">— Surya Kumar</p>
            </section>

            {/* ── Logos Strip ── */}
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

            {/* ── How It Works ── */}
            <section className="how-it-works" id="how-it-works" ref={howRef}>
                <div className="section-header">
                    <div className="section-tag">Process</div>
                    <h2 className="section-title">
                        Three Steps to <span className="gradient-text">Interview Success</span>
                    </h2>
                </div>

                <div className={`steps-grid ${howInView ? 'steps-grid--visible' : ''}`}>
                    {steps.map((step, i) => (
                        <div key={i} className="step-card" style={{ '--delay': `${i * 0.15}s` }}>
                            <div className="step-card__number">{step.number}</div>
                            <h3 className="step-card__title">{step.title}</h3>
                            <p className="step-card__desc">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Stats (2400+ removed) ── */}
            <section className="stats-section" id="stats" ref={statsRef}>
                <div className="stats-section__inner">
                    <h2 className="stats-title">
                        Trusted by candidates <span className="gradient-text">worldwide</span>
                    </h2>
                    <div className="stats-grid">
                        <StatCard value={87}  suffix="%" label="Avg. Match Score"      start={statsInView} />
                        <StatCard value={30}  suffix="s" label="Avg. Generation Time" start={statsInView} />
                        <StatCard value={94}  suffix="%" label="User Satisfaction"    start={statsInView} />
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
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
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
