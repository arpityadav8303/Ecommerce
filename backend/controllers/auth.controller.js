import {User} from "../modals/user.modal.js"
import bcrypt from "bcrypt"
import { generateToken } from "../utils/jwt.js"

const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;

        if ([name, email, password, phone, address].some((field) => !field || field.trim() === "")) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: "User already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            address
        })
        await newUser.save()

        // Generate JWT token
        const token = generateToken(newUser._id)

        res.status(201).json({ 
            message: "User registered successfully", 
            userId: newUser._id,
            token: token
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
}

const LoginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User does not exist" })
        }

        const isPasswordCorrect = await user.isPasswordCorrect(password)
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Incorrect password" })
        }

        const token = generateToken(user._id)

        // Send response with token
        res.status(200).json({ 
            message: "Login successful", 
            token: token,
            userId: user._id
        })
    }
    
    catch(err){
        console.log(err)
        res.status(500).json({message:"Internal server error"})
    }
}

export { registerUser, LoginUser}