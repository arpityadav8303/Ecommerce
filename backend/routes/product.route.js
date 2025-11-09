// Import all product controller functions
import { 
    getAllProducts,
    getProductById,
    getProductsByCategory,
    searchProducts,
    addProduct
} from "../controllers/product.controller.js"



import express from "express"

// Create router
const router = express.Router()
router.get("/", getAllProducts)
router.get("/search", searchProducts)
router.get("/category/:category", getProductsByCategory)
router.get("/:id", getProductById)
router.post("/", addProduct)

// Export router
export default router