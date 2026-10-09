import axios from "axios";


const api=axios.create({
baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
withCredentials:true
})

// Automatically attach Bearer token from localStorage to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
})

export async function register({username,email,password}) {

    try {
      const response=await  api.post('/api/auth/register',{
        username,email,password
    })
    const { token } = response.data
    if (token) localStorage.setItem("token", token)
    return response.data
        
    } catch (error) {
        console.log(error)
        throw error
    }

    
}

export async function login({email,password}) {
    try {
      const response=await api.post("/api/auth/login",{
        email,password
      }) 
      const { token } = response.data
      if (token) localStorage.setItem("token", token)
      return response.data
    } catch (error) {
        console.log(error)
        throw error
    }
}

export async function logout() {
  try {
    const response=await api.get("/api/auth/logout")
    localStorage.removeItem("token")
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getMe() {
  try {
    const response=await api.get("/api/auth/get-me")
    return response.data
  } catch (error) {
    // Don't log — 401 is expected when not logged in
    throw error
  }
}