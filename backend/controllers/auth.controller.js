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

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
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

        if (!email || !password) {
            throw new ApiError(400, "All fields are required");
        }

        const user = await User.findOne({ email });
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const isPasswordCorrect = user.isPasswordCorrect
            ? await user.isPasswordCorrect(password)
            : await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            throw new ApiError(401, "Invalid credentials");
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                userId: user._id,
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

export { registerUser, loginUser };