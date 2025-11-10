import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-Commerce API',
            version: '1.0.0',
            description: 'Complete E-Commerce Backend API with Authentication, Products, and Cart Management',
            contact: {
                name: 'API Support',
                email: 'support@ecommerce.com'
            }
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 8000}`,
                description: 'Development server'
            },
            {
                url: 'https://api.ecommerce.com',
                description: 'Production server'
            }
        ],
        components: {
            schemas: {
                User: {
                    type: 'object',
                    required: ['name', 'email', 'password', 'phone', 'address'],
                    properties: {
                        _id: {
                            type: 'string',
                            example: '64a1c2f3e4b5c6d7e8f9g0h1'
                        },
                        name: {
                            type: 'string',
                            example: 'Wireless Headphones'
                        },
                        price: {
                            type: 'number',
                            example: 99.99
                        },
                        description: {
                            type: 'string',
                            example: 'High quality wireless headphones with noise cancellation'
                        },
                        category: {
                            type: 'string',
                            example: 'Electronics'
                        },
                        brand: {
                            type: 'string',
                            example: 'Sony'
                        },
                        stock: {
                            type: 'integer',
                            example: 50
                        },
                        images: {
                            type: 'array',
                            items: {
                                type: 'string',
                                format: 'uri'
                            }
                        },
                        rating: {
                            type: 'number',
                            example: 4.5
                        },
                        reviews: {
                            type: 'integer',
                            example: 120
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            example: 'Error message'
                        },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    field: {
                                        type: 'string'
                                    },
                                    message: {
                                        type: 'string'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./routes/*.js']
};

const specs = swaggerJsdoc(options);
export default specs;