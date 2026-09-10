import React,{useState} from 'react'
import { useNavigate,Link, Navigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import "../auth.form.scss"
import AuthLoading from '../components/AuthLoading'

const Register = () => {
  
  const navigate=useNavigate()
  const [username, setusername] = useState("")
  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")
  const{user, loading, initializing, handleRegister}=useAuth()

  const handleSubmit=async(e)=>{
    e.preventDefault()
    try {
      await handleRegister({username,email,password})
      navigate("/dashboard")
    } catch (error) {
      // Registration failed — stay on the page
    }
  }
  // Already logged in → skip register page
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
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor='username'>Username</label>
            <input 
              onChange={(e)=>setusername(e.target.value)}
              type='text' id='username' name='username' placeholder='Enter username'
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor='email'>Email</label>
            <input
              onChange={(e)=>setemail(e.target.value)} 
              type='email' id='email' name='email' placeholder='Enter email address'
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor='password'>Password</label>
            <input
              onChange={(e)=>setpassword(e.target.value)}
              type='password' id='password' name='password' placeholder='Enter password'
              required
            />
          </div>
          <button className='button primary-button' type="submit">Register</button>
        </form>
        <p>Already have an account? <Link to={"/login"}>Login</Link></p>
      </div>
    </main>
  )
}

export default Register