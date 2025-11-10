import { User } from "../modals/user.modal.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";
import { ApiError } from "../utils/Apierrors.js";

// ============ REGISTER USER ============
const registerUser = async (req, res) => {
    try {
        const name = req.body.name?.trim();
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password?.trim();
        const phone = req.body.phone?.trim();
        const address = req.body.address?.trim();

        if ([name, email, password, phone, address].some(field => !field)) {
            throw new ApiError(400, "All fields are required");
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new ApiError(400, "User already exists");
        }

        const newUser = new User({
            name,
            email,
            password,
            phone,
            address
        });

        await newUser.save();

        const token = generateToken(newUser._id);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                userId: newUser._id,
                token
            }
        });

    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Internal server error",
            error: err.errors || []
        });
    }
};

// ============ LOGIN USER ============

const loginUser = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password?.trim();

        console.log("🔍 LOGIN DEBUG:");
        console.log("Email received:", email);
        console.log("Password received:", password);
        console.log("Password length:", password?.length);

        // Validate presence of fields
        if (!email || !password) {
            throw new ApiError(400, "Email and password are required");
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new ApiError(400, "Invalid email format");
        }

        // Find user by email
        const user = await User.findOne({ email });
        console.log("🔍 User found in DB:", user ? "YES ✅" : "NO ❌");
        
        if (user) {
            console.log("User ID:", user._id);
            console.log("User email in DB:", user.email);
            console.log("Password hash in DB:", user.password?.substring(0, 20) + "...");
        }

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Compare password
        console.log("🔍 Comparing passwords...");
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        console.log("Password match:", isPasswordCorrect ? "✅ YES" : "❌ NO");

        if (!isPasswordCorrect) {
            throw new ApiError(401, "Invalid credentials");
        }

        // Generate JWT token
        const token = generateToken(user._id);
        console.log("✅ Token generated successfully");

        // Respond with token and basic user info
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                userId: user._id,
                name: user.name,
                email: user.email,
                token
            }
        });

    } catch (err) {
        console.error("❌ Login error:", err.message);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Internal server error",
            error: err.errors || []
        });
    }
};



export { registerUser, loginUser };