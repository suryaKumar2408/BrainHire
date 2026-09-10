import React,{useState} from 'react'
import "../auth.form.scss"
import { useNavigate,Link, Navigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import AuthLoading from '../components/AuthLoading'

const Login = () => {

  const {user, loading, initializing, handleLogin}=useAuth()
  const navigate=useNavigate()
  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")

  const handleSubmit=async (e)=>{
    e.preventDefault()
    await handleLogin({email,password})
    navigate('/dashboard')
  }

  // Already logged in → skip login page
  if (!initializing && user) {
    return <Navigate to="/dashboard" replace />
  }

  if(initializing){
    return <AuthLoading />
  }

  return (
    <main className="auth-page">
      {/* Full display background robotic image */}
      <div className="auth-bg">
        <img src="/hero-hands.jpg" alt="" aria-hidden="true" />
      </div>
      <div className="auth-overlay" />
      <div className="auth-grid" />
      <div className="auth-glow" />

      <div className='form-container'>
        <div className="auth-brand">
          <span className="auth-brand-dot" />
          <span>BrainHire</span>
        </div>
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor='email'>Email</label>
            <input 
              onChange={(e)=>{setemail(e.target.value)}}
              type='email' id='email' name='email' placeholder='Enter your email address'
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor='password'>Password</label>
            <input 
              onChange={(e)=>{setpassword(e.target.value)}}
              type='password' id='password' name='password' placeholder='Enter your password'
              required
            />
          </div>
          <button className='button primary-button' type="submit">Login</button>
        </form>
        <p>Don't have an account? <Link to={"/register"}>Register</Link></p>
      </div>
    </main>
  )
}

export default Login;