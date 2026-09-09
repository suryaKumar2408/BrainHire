import React, { useState, useEffect, useRef } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import '../style/landing.scss'

// ── Animated counter hook ──
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

// ── Intersection observer hook ──
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

// ── Particle background ──
const ParticleCanvas = () => {
    const canvasRef = useRef(null)
    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let animId
        const particles = []
        const resize = () => {
            canvas.width = canvas.offsetWidth
            canvas.height = canvas.offsetHeight
        }
        resize()
        window.addEventListener('resize', resize)
        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.4 + 0.3,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.25,
                opacity: Math.random() * 0.4 + 0.08
            })
        }
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy
                if (p.x < 0) p.x = canvas.width
                if (p.x > canvas.width) p.x = 0
                if (p.y < 0) p.y = canvas.height
                if (p.y > canvas.height) p.y = 0
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(78, 205, 196, ${p.opacity})`
                ctx.fill()
            })
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < 110) {
                        ctx.beginPath()
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.strokeStyle = `rgba(78,205,196,${0.07 * (1 - dist / 110)})`
                        ctx.lineWidth = 0.5
                        ctx.stroke()
                    }
                }
            }
            animId = requestAnimationFrame(draw)
        }
        draw()
        return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
    }, [])
    return <canvas ref={canvasRef} className="particle-canvas" />
}

// ── Typing text effect ──
const TypingText = ({ words }) => {
    const [idx, setIdx] = useState(0)
    const [subIdx, setSubIdx] = useState(0)
    const [deleting, setDeleting] = useState(false)
    const [blink, setBlink] = useState(true)
    useEffect(() => {
        const t = setInterval(() => setBlink(b => !b), 500)
        return () => clearInterval(t)
    }, [])
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!deleting && subIdx === words[idx].length) {
                setTimeout(() => setDeleting(true), 1200); return
            }
            if (deleting && subIdx === 0) {
                setDeleting(false); setIdx(i => (i + 1) % words.length); return
            }
            setSubIdx(s => s + (deleting ? -1 : 1))
        }, deleting ? 60 : 100)
        return () => clearTimeout(timeout)
    }, [subIdx, deleting, idx, words])
    return (
        <span className="typing-text">
            {words[idx].substring(0, subIdx)}
            <span className={`cursor ${blink ? 'cursor--visible' : ''}`}>|</span>
        </span>
    )
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
    const [loaded, setLoaded] = useState(false)
    const [curtainDone, setCurtainDone] = useState(false)
    const [scrollY, setScrollY] = useState(0)
    const [statsRef, statsInView] = useInView(0.3)
    const [ctaRef, ctaInView] = useInView(0.2)

    useEffect(() => {
        const t1 = setTimeout(() => setLoaded(true), 800)
        const t2 = setTimeout(() => setCurtainDone(true), 1600)
        return () => { clearTimeout(t1); clearTimeout(t2) }
    }, [])

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
            setScrollY(window.scrollY)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    if (!initializing && user) return <Navigate to="/dashboard" replace />

    // Parallax — image scrolls at 40% of page speed
    const heroBgParallax = scrollY * 0.40

    return (
        <div className="landing">

            {/* ── Page Curtain Loader ── */}
            {!curtainDone && (
                <div className={`curtain ${loaded ? 'curtain--slide' : ''}`}>
                    <div className="curtain__left" />
                    <div className="curtain__right" />
                    <div className="curtain__logo">
                        <div className="curtain__logo-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                            </svg>
                        </div>
                        <span>BrainHire</span>
                    </div>
                    <div className="curtain__progress">
                        <div className={`curtain__bar ${loaded ? 'curtain__bar--full' : ''}`} />
                    </div>
                </div>
            )}

            {/* ── Navbar ── */}
            <nav className={`landing-nav ${scrolled ? 'landing-nav--scrolled' : ''}`}>
                <div className="landing-nav__inner">
                    <a href="#" className="landing-nav__logo">
                        <span className="logo-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                            </svg>
                        </span>
                        BrainHire
                    </a>

                    <ul className="landing-nav__links">
                        <li><a href="#stats">Results</a></li>
                        <li><a href="#testimonial">Reviews</a></li>
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

                <div className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`}>
                    <a href="#stats" onClick={() => setMenuOpen(false)}>Results</a>
                    <a href="#testimonial" onClick={() => setMenuOpen(false)}>Reviews</a>
                    <Link to="/login" onClick={() => setMenuOpen(false)}>Log In</Link>
                    <Link to="/register" className="mobile-cta" onClick={() => setMenuOpen(false)}>Get Started Free</Link>
                </div>
            </nav>

            {/* ════════════════════════════════
                ── HERO — full-bleed bg image ──
                ════════════════════════════════ */}
            <section className="hero">

                {/* Robotic hands — full-bleed background with parallax */}
                <div
                    className="hero__bg-image"
                    style={{ transform: `translateY(${heroBgParallax}px)` }}
                >
                    <img src="/hero-hands.jpg" alt="" aria-hidden="true" />
                </div>

                {/* Dark gradient overlay so text is readable */}
                <div className="hero__bg-overlay" />

                {/* Halftone / noise grain layer */}
                <div className="hero__noise" />

                {/* Ambient teal glow behind text */}
                <div className="hero__orb hero__orb--center" />

                {/* Particles on top */}
                <ParticleCanvas />

                {/* ── Text content centered on top ── */}
                <div className={`hero__content ${curtainDone ? 'hero__content--visible' : ''}`}>

                    <div className="hero__badge">
                        <span className="hero__badge-dot" />
                        AI-Powered Interview Coaching
                    </div>

                    <h1 className="hero__headline">
                        <span className="hero__headline-line hero__headline-line--1">
                            Interview prep that works
                        </span>
                        <span className="hero__headline-line hero__headline-line--2">
                            like an{' '}
                            <span className="hero__headline--accent">
                                <TypingText words={['AI Coach', 'Smart AI', 'BrainHire']} />
                            </span>
                        </span>
                    </h1>

                    <p className={`hero__sub ${curtainDone ? 'hero__sub--visible' : ''}`}>
                        Upload your resume, paste the job description, and let our AI craft a personalized
                        interview strategy — complete with targeted questions and your match score.
                    </p>

                    <div className={`hero__actions ${curtainDone ? 'hero__actions--visible' : ''}`}>
                        <Link to="/register" className="btn-hero btn-hero--primary" id="hero-cta">
                            Start For Free
                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </Link>
                    </div>

                </div>
            </section>

            {/* ── Testimonial ── */}
            <section className="testimonial" id="testimonial">
                <div className="testimonial__avatar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#37b3aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                <div className="testimonial__stars">{'★'.repeat(5)}</div>
                <h3 className="testimonial__title">Quick and Easy Setup</h3>
                <blockquote className="testimonial__quote">
                    "We've gone through hundreds of interview cycles — BrainHire is the only prep tool that actually understands our job descriptions and gives questions that matter."
                </blockquote>
                <p className="testimonial__attr">— Surya Kumar</p>
            </section>

            {/* ── Stats ── */}
            <section className="stats-section" id="stats" ref={statsRef}>
                <div className="stats-section__inner">
                    <h2 className="stats-title">
                        Trusted by candidates <span className="gradient-text">worldwide</span>
                    </h2>
                    <div className="stats-grid">
                        <StatCard value={87} suffix="%" label="Avg. Match Score" start={statsInView} />
                        <StatCard value={30} suffix="s" label="Avg. Generation Time" start={statsInView} />
                        <StatCard value={94} suffix="%" label="User Satisfaction" start={statsInView} />
                    </div>
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="cta-banner" ref={ctaRef}>
                <div className="cta-banner__orb" />
                <div className="cta-banner__grid" />
                <div className={`cta-banner__content ${ctaInView ? 'cta-banner__content--visible' : ''}`}>
                    <h2 className="cta-banner__title">Ready to Ace Your Next Interview?</h2>
                    <p className="cta-banner__sub">Join thousands of candidates who landed their dream roles using BrainHire.</p>
                    <Link to="/register" className="btn-hero btn-hero--primary btn-hero--lg" id="footer-cta">
                        Get Started — It's Free
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
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
                                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                                </svg>
                            </span>
                            BrainHire
                        </a>
                        <p className="footer-brand__desc">AI-powered interview preparation platform for modern job seekers.</p>
                    </div>
                    <div className="footer-links">
                        <div className="footer-col">
                            <h4>Product</h4>
                            <Link to="/login">Dashboard</Link>
                            <a href="#stats">Results</a>
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
