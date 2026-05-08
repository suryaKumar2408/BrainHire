import { createContext, useState, useEffect } from "react";
import { getMe } from "./services/auth.api";

export const AuthContext=createContext()

export const AuthProvider=({children})=>{
    
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)    // for login/register actions
    const [initializing, setInitializing] = useState(true) // for startup getMe check

    useEffect(() => {
        const getAndSetUser = async () => {
            try {
                const data = await getMe()
                setUser(data.user)
            } catch (error) {
                // Expected 401 when not logged in — no need to log
                setUser(null)
            } finally {
                setInitializing(false)
            }
        }

        getAndSetUser()
    }, [])

    return(<AuthContext.Provider value={{user, setUser, loading, setLoading, initializing}}>
        {children}
    </AuthContext.Provider>

    )
}