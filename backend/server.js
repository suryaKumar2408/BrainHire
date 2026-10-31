require("dotenv").config()
const app = require("./src/app")
const connectToDB=require("./src/config/database")

connectToDB()

app.listen(3001 ,()=>{
    console.log("server is runing on port 3001")
})