import mongoose from "mongoose"
import { Product } from "../modals/product.modal.js"
import { ApiError } from "../utils/Apierrors.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js"

// Helper to handle errors consistently
const handleError = (err, res) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors || []
        })
    }
    console.error(err)
    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message
    })
}

// ============ GET ALL PRODUCTS ============
export const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const skip = (page - 1) * limit

        const products = await Product.find()
            .lean()
            .limit(limit)
            .skip(skip)

        if (!products || products.length === 0) {
            throw new ApiError(404, "No products found")
        }

        const total = await Product.countDocuments()

        res.status(200).json({
            success: true,
            message: "Products retrieved successfully",
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            },
            count: products.length,
            products
        })
    } catch (err) {
        handleError(err, res)
    }
}

// ============ GET PRODUCT BY ID ============
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(400, "Invalid product ID format")
        }

        const product = await Product.findById(id).lean()

        if (!product) {
            throw new ApiError(404, "Product not found")
        }

        res.status(200).json({
            success: true,
            message: "Product retrieved successfully",
            product
        })
    } catch (err) {
        handleError(err, res)
    }
}

// ============ GET PRODUCTS BY CATEGORY ============
export const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params

        if (!category || category.trim() === "") {
            throw new ApiError(400, "Category is required")
        }

        const normalizedCategory = category.trim().toLowerCase()
        const products = await Product.find({
            category: { $regex: normalizedCategory, $options: "i" }
        }).lean()

        if (!products || products.length === 0) {
            throw new ApiError(404, `No products found in ${category} category`)
        }

        res.status(200).json({
            success: true,
            message: `Products in ${category} category retrieved successfully`,
            count: products.length,
            products
        })
    } catch (err) {
        handleError(err, res)
    }
}

// ============ SEARCH PRODUCTS ============
export const searchProducts = async (req, res) => {
    try {
        const { keyword } = req.query

        if (!keyword || keyword.trim() === "") {
            throw new ApiError(400, "Search keyword is required")
        }

        const normalizedKeyword = keyword.trim().toLowerCase()
        const products = await Product.find({
            $or: [
                { name: { $regex: normalizedKeyword, $options: "i" } },
                { description: { $regex: normalizedKeyword, $options: "i" } },
                { brand: { $regex: normalizedKeyword, $options: "i" } }
            ]
        }).lean()

        if (!products || products.length === 0) {
            throw new ApiError(404, `No products found matching "${keyword}"`)
        }

        res.status(200).json({
            success: true,
            message: `Search results for "${keyword}"`,
            count: products.length,
            products
        })
    } catch (err) {
        handleError(err, res)
    }
}

// ============ ADD PRODUCT WITH CLOUDINARY IMAGE UPLOAD ============
export const addProduct = async (req, res) => {
    try {
        console.log("📥 Add Product Request Received")
        console.log("Body:", req.body)
        console.log("Files:", req.files ? `${req.files.length} files` : "No files")

        // Get fields from req.body
        const { name, price, description, category, brand, stock } = req.body

        // ============ CONVERT STRING VALUES TO CORRECT TYPES ============
        // Form-data sends everything as strings, need to convert
        const parsedPrice = parseFloat(price)
        const parsedStock = parseInt(stock)

        console.log(`Name: ${name}, Price: ${parsedPrice}, Stock: ${parsedStock}`)

        // ============ VALIDATE ALL REQUIRED FIELDS ============
        if (!name || !price || !description||!category || !brand || stock === undefined) {
            console.error("❌ Missing fields:", { name, price, category,description, brand, stock })
            throw new ApiError(400, "All fields are required")
        }

        // ============ VALIDATE FIELD TYPES ============
        if (typeof name !== "string" || name.trim() === "") {
            throw new ApiError(400, "Product name must be a non-empty string")
        }

        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            throw new ApiError(400, "Price must be a valid positive number")
        }

        if (typeof description !== "string" || description.trim() === "") {
            throw new ApiError(400, "Description must be a non-empty string")
        }

        if (isNaN(parsedStock) || parsedStock < 0) {
            throw new ApiError(400, "Stock must be a valid non-negative number")
        }

        // ============ VALIDATE IMAGE FILES ============
        console.log("🖼️ Checking for images...")
        if (!req.files || req.files.length === 0) {
            console.error("❌ No files uploaded")
            throw new ApiError(400, "At least one image is required")
        }

        console.log(`✅ Found ${req.files.length} files`)

        // ============ CHECK DUPLICATE PRODUCT ============
        const existingProduct = await Product.findOne({ name })
        if (existingProduct) {
            throw new ApiError(400, "Product with this name already exists")
        }

        // ============ UPLOAD IMAGES TO CLOUDINARY ============
        const imageUrls = []

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i]
            try {
                console.log(`📤 [${i + 1}/${req.files.length}] Uploading: ${file.originalname}`)
                console.log(`📁 File path: ${file.path}`)

                // Upload to Cloudinary
                const cloudinaryResponse = await uploadOnCloudinary(file.path)

                if (cloudinaryResponse && cloudinaryResponse.url) {
                    imageUrls.push(cloudinaryResponse.url)
                    console.log(`✅ [${i + 1}/${req.files.length}] Uploaded: ${cloudinaryResponse.url}`)
                } else {
                    console.error(`❌ Cloudinary returned no URL for ${file.originalname}`)
                    throw new ApiError(400, `Failed to upload image: ${file.originalname}`)
                }
            } catch (uploadError) {
                console.error(`❌ Error uploading ${file.originalname}:`, uploadError.message)
                throw new ApiError(400, `Failed to upload image: ${file.originalname}`)
            }
        }

        // ============ VALIDATE ALL IMAGES UPLOADED ============
        if (imageUrls.length === 0) {
            throw new ApiError(400, "No images were successfully uploaded to Cloudinary")
        }

        console.log(`✅ All ${imageUrls.length} images uploaded successfully`)

        // ============ CREATE PRODUCT ============
        const product = new Product({
            name: name.trim(),
            price: parsedPrice,
            description: description.trim(),
            images: imageUrls,
            category: category.trim(),
            brand: brand.trim(),
            stock: parsedStock
        })

        // ============ SAVE TO DATABASE ============
        await product.save()
        console.log(`✅ Product saved to database: ${product._id}`)

        // ============ SEND SUCCESS RESPONSE ============
        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product
        })

    } catch (err) {
        console.error("❌ Error in addProduct:", err.message)
        handleError(err, res)
    }
}