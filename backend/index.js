import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './DB/db.js';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import productRoutes from './routes/product.route.js';
import { errorHandler, notFound } from './middleware/errorHandler.middleware.js';
import { generateLimiter } from './middleware/ratelimitor.middleware.js';
import specs from './swagger.js';
import cartRoutes from "./routes/cart.route.js";


dotenv.config();

const app = express();


app.use(helmet());


if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); 
} else {
    app.use(morgan('combined')); 
}


app.use(generateLimiter);


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.static('public'));


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    swaggerOptions: {
        persistAuthorization: true
    }
}));


app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'Server is running',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});


app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);



app.use(notFound);


app.use(errorHandler);


connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port: ${process.env.PORT || 8000}`);
            console.log(`📚 API Documentation: http://localhost:${process.env.PORT || 8000}/api-docs`);
            console.log(`❤️ Health Check: http://localhost:${process.env.PORT || 8000}/health`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });

export default app;