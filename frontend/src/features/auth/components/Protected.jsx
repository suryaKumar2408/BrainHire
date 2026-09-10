import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import React from 'react'
import AuthLoading from './AuthLoading'

const Protected = ({children}) => {
    const { initializing, user } = useAuth()
    
    if(initializing){
        return <AuthLoading />
    }

    if(!user){
        return <Navigate to={"/login"}/>
    }

  return children
}

export default Protected