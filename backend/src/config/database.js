const mongoose= require("mongoose")

async function connectToDB() {
    try{
        await mongoose.connect(process.env.MONGO_URI)

    console.log("CONNECTED TO DATABASE ")
    }
    catch(error){
        console.log(error)
    }
}

module.exports=connectToDB