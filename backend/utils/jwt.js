import jwt from "jsonwebtoken"

const generateToken = (userId) => {
    const secret = process.env.JWT_TOKEN
    console.log("🔍 JWT_TOKEN value:", secret)
    console.log("🔍 All env vars:", process.env)
    
    if (!secret) {
        throw new Error("JWT_TOKEN is not defined in .env file")
    }
    
    return jwt.sign({ userId }, secret, { expiresIn: "7d" })
}

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_TOKEN)
}

export { generateToken, verifyToken }