import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import { connectDB } from './DB/db.js'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.route.js'
import productRoutes from './routes/product.route.js'


dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('public'))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })

