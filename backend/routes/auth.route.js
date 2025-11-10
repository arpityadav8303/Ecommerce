import {registerUser,loginUser} from "../controllers/auth.controller.js"
import {registerSchema,loginSchema,validateRequest} from "../validators/auth.validator.js"
import { authLimiter } from "../middleware/ratelimitor.middleware.js" 
import express from "express"

const router=express.Router()

router.post("/register",authLimiter,validateRequest(registerSchema),registerUser)
router.post("/login",authLimiter,validateRequest(loginSchema),loginUser)

export default router;