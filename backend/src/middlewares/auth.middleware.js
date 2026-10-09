const jwt=require("jsonwebtoken")
const tokenBlacklistModel=require("../models/blacklist.model")



async function authUser(req,res,next){
    // Support both Bearer token (Authorization header) and httpOnly cookie
    // Bearer header is used for cross-origin deployments where third-party cookies are blocked
    let token = null

    const authHeader = req.headers["authorization"]
    if(authHeader && authHeader.startsWith("Bearer ")){
        token = authHeader.slice(7)
    } else {
        token = req.cookies.token
    }

    if(!token){
        return res.status(401).json({
            message:"Token not provided"
        })
    }

    const isTokenBlacklisted=await tokenBlacklistModel.findOne({
        token
    })
    if(isTokenBlacklisted){
        return res.status(401).json({
            message:"Token is invalid"
        })
    }
    try{
    const decoded = jwt.verify(token,process.env.JWT_SECRET)

    req.user=decoded

    next()


    }catch(err){
        return res.status(401).json({
            message:"Invalid Token"
        })
    }
}

module.exports={authUser}