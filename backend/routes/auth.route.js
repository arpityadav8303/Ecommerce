import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import { registerSchema, loginSchema, validateRequest } from "../validators/auth.validator.js";
import { authLimiter } from "../middleware/ratelimitor.middleware.js";

const router = express.Router();

// ✅ Apply rate limiter and validation middleware before controller
router.post("/register", authLimiter, validateRequest(registerSchema), registerUser);
router.post("/login", authLimiter, validateRequest(loginSchema), loginUser);

export default router;