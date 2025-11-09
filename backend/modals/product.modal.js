import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        images: {
            type: [String],  // Changed to array
            required: true
        },
        category: {
            type: String,
            required: true,
            trim: true
        },
        brand: {
            type: String,
            required: true,
            trim: true
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        reviews: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

export const Product = mongoose.model("Product", ProductSchema);