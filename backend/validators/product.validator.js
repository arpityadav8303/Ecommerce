import Joi from "joi";

const addProductSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(100)
        .required()
        .trim(),
    
    price: Joi.number()
        .positive()
        .precision(2)
        .required(),
    
    description: Joi.string()
        .min(10)
        .max(1000)
        .required()
        .trim(),
    
    category: Joi.string()
        .min(2)
        .max(50)
        .required()
        .trim(),
    
    brand: Joi.string()
        .min(2)
        .max(50)
        .required()
        .trim(),
    
    stock: Joi.number()
        .integer()
        .min(0)
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

export { addProductSchema, validateRequest };