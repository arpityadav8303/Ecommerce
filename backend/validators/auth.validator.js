import joi from "joi";

const registerSchema=joi.object({
    name:joi.string()
    .required()
    .min(3)
    .max(15)
    .trim()
    .messages({
        "string.min": "Name must be at least 3 characters",
        "string.max": "Name cannot exceed 50 characters",
        "any.required": "Name is required"
    }),
    email:joi.string()
    .email()
    .required()
    .lowercase()
    .trim()
     .messages({
        "string.email": "Invalid email format",
        "any.required": "Email is required"
    }),
    password:joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
        "string.min": "Password must be at least 8 characters",
        "string.pattern.base": "Password must contain uppercase, lowercase, and numbers",
        "any.required": "Password is required"
    }),
    phone:joi.string()
    .required()
    .length(10)
    .pattern(/^[0-9]+$/)
    .messages({
       "string.pattern.base": "Phone must be a valid 10-digit number",
       "any.required": "Phone is required"
    }),
    address:joi.string()
    .required()
    .min(5)
    .max(100)
    .trim()
    .messages({
        "string.min": "Address must be at least 5 characters",
        "string.max": "Address cannot exceed 100 characters",
        "any.required": "Address is required"
    })
})

const loginSchema = joi.object({
    email: joi.string()
        .email()
        .required()
        .lowercase()
        .trim(),
    
    password: joi.string()
        .min(8)
        .required()
});

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message
            }));
            
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }
        
        req.validatedData = value;
        next();
    };
};


export {registerSchema,loginSchema,validateRequest}