import { ApiError } from "../utils/Apierrors.js";

// ============ GLOBAL ERROR HANDLER ============
const errorHandler = (err, req, res, next) => {
    // Log error for debugging
    console.error("❌ Error caught by global handler:", {
        message: err.message,
        stack: err.stack,
        name: err.name
    });
    
    // ============ If already an ApiError ============
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
            ...(process.env.NODE_ENV === "development" && { stack: err.stack })
        });
    }
    
    // ============ Mongoose validation error ============
    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
        
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: errors
        });
    }
    
    // ============ Mongoose duplicate key error ============
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`,
            errors: [{
                field: field,
                message: `This ${field} is already in use`
            }]
        });
    }
    
    // ============ JWT errors ============
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid or malformed token",
            errors: []
        });
    }
    
    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Token has expired",
            errors: []
        });
    }
    
    // ============ Multer file upload errors ============
    if (err.name === "MulterError") {
        let message = "File upload error";
        
        if (err.code === "LIMIT_FILE_SIZE") {
            message = "File size exceeds maximum limit (5MB)";
        } else if (err.code === "FILE_TOO_LARGE") {
            message = "File is too large";
        }
        
        return res.status(400).json({
            success: false,
            message: message,
            errors: []
        });
    }
    
    // ============ Cast error (invalid MongoDB ID) ============
    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format",
            errors: []
        });
    }
    
    // ============ Default error ============
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal server error",
        errors: [],
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
};

// ============ ASYNC HANDLER WRAPPER ============
// Wraps async functions to catch errors automatically
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// ============ 404 HANDLER ============
const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.originalUrl
    });
};

export { errorHandler, asyncHandler, notFound };