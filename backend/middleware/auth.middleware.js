import jwt from "jsonwebtoken";
import { User } from "../modals/user.modal.js";
import { ApiError } from "../utils/Apierrors.js";

export const verifyAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            throw new ApiError(401, "No token provided");
        }

        const decoded = jwt.verify(token, process.env.JWT_TOKEN);
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            throw new ApiError(401, "User not found");
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("❌ Auth Error:", err.message);
        res.status(err.statusCode || 401).json({
            success: false,
            message: err.message || "Authentication failed"
        });
    }
};
export {verifyAuth}