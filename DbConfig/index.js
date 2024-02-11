import mongoose from "mongoose";

const dbConnection = async ()=>{
    try {
        const connect = await mongoose.connect(process.env.MONGODB_URL)
        console.log("DB Connected succssfully")
    } catch (error) {
        console.log("DB ERROR", error)
    }
}

export default dbConnection