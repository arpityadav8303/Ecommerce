import mongoose from "mongoose";
import bcrypt from "bcrypt";


const UserSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true,
            minlength: 8
        },
        phone:{
            type:String,
            required:true
        },
        address:{
            type:String,
            required:true
        },
    },
    {
        timestamps:true
    }
)
// pre save 

UserSchema.pre("save",async function(next){
    if(!this.isModified("password")){
       return  next()
    }
   try {
        // ✅ ADD AWAIT HERE
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
})

UserSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}



export const User=mongoose.model("User",UserSchema)