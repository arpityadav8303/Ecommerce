// Import all product controller functions
import upload from "../middleware/multer.middleware.js"
import {
    getAllProducts,
    getProductById,
    getProductsByCategory,
    searchProducts,
    addProduct
} from "../controllers/product.controller.js"
import express from "express"

const router = express.Router()

// ============ GET ROUTES (No image upload needed) ============
// Get all products with pagination
// Usage: GET /api/products?page=1&limit=10
router.get("/", getAllProducts)

// Search products by keyword
// Usage: GET /api/products/search?keyword=nike
router.get("/search", searchProducts)

// Get products by category
// Usage: GET /api/products/category/shoes
router.get("/category/:category", getProductsByCategory)

// Get single product by ID
// Usage: GET /api/products/690f1858eb88fb75ea6b9fba
router.get("/:id", getProductById)

// ============ POST ROUTE (With image upload) ============
// Add new product with image upload
// upload.array("images", 5) = accept up to 5 files with field name "images"
// Usage: POST /api/products with form-data containing images
router.post("/", upload.array("images", 5), addProduct)

export default router