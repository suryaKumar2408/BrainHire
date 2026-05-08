import React,{useState} from 'react'
import { useNavigate,Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'

const Register = () => {
  
  const navigate=useNavigate()
  const [username, setusername] = useState("")
  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")
  const{loading, initializing, handleRegister}=useAuth()

  const handleSubmit=async(e)=>{
    e.preventDefault()
    try {
      await handleRegister({username,email,password})
      navigate("/")
    } catch (error) {
      // Registration failed — stay on the page
    }
  }
  if(initializing){
    return(<main><h1>Loading.......</h1></main>)
  }
  
  return (
    <main>
      <div className='form-container'>
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor='username'>Username</label>
            <input 
            onChange={(e)=>setusername(e.target.value)}
            type='text' id='username'name='username'placeholder='enter username'></input>
          </div>
          <div className="input-group">
            <label htmlFor='email'>Email</label>
            <input
            onChange={(e)=>setemail(e.target.value)} 
            type='email' id='email' name='email'placeholder='enter email address'></input>
          </div>
          <div className="input-group">
            <label htmlFor='password'>Password</label>
            <input
            onChange={(e)=>setpassword(e.target.value)}
             type='password' id='password'name='password'placeholder='enter password'></input>
          </div>
          <button className='button primary-button'>Register</button>
        </form>
        <p>Already have an account? <Link to={"/login"}>Login</Link></p>
      </div>
    </main>
  )
}

export default Register