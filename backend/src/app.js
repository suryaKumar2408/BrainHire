const express= require("express")
const cookieParser=require("cookie-parser")
const cors=require("cors")

const app=express()

app.use(express.json())
app.use(cookieParser())
const ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://brain-hire.vercel.app",
]

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, Postman, server-to-server)
        if (!origin) return callback(null, true)

        // Allow exact matches
        if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true)

        // Allow all Vercel preview deployment URLs for this project
        if (/^https:\/\/brain-hire[\w-]*\.vercel\.app$/.test(origin)) return callback(null, true)

        callback(new Error(`CORS: origin '${origin}' not allowed`))
    },
    credentials: true,
}))

//require all the routes here
const authRouter=require("./routes/auth.routes")
const interviewRouter=require("./routes/interview.routes")

//using all the routes here
app.use("/api/auth",authRouter)
app.use("/api/interview",interviewRouter)
module.exports=app