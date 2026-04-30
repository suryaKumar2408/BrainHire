import React,{useState} from 'react'
import "../auth.form.scss"
import { useNavigate,Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Login = () => {

  const {loading,handleLogin}=useAuth()
  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")

  const handleSubmit=async (e)=>{
    e.preventDefault()
    handleLogin({email,password})
  }

  if(loading){
    return(<main><h1>Loading.......</h1></main>)
  }

  return (
    <main>
      <div className='form-container'>
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor='email'>Email</label>
            <input 
            onChange={(e)=>{setemail(e.target.value)}}
            type='email' id='email'name='email'placeholder='enter email address'></input>
          </div>
          <div className="input-group">
            <label htmlFor='password'>Password</label>
            <input 
            onChange={(e)=>{setpassword(e.target.value)}}
            type='password' id='password'name='password'placeholder='enter password'></input>
          </div>
          <button className='button primary-button'>Login</button>
        </form>
        <p>Don't have an account? <Link to={"/Register"}>Register</Link></p>
      </div>
    </main>
  )
}

export default Login;