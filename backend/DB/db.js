import mongoose, { mongo } from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const connectDB=async()=>{
    try{
      mongoose.connect(process.env.MONGO_URI)
      console.log("Db connected")
    }
    catch(err){
        console.log("Db not connected")
    }
} 

export {connectDB}