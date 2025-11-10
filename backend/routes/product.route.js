// Import all product controller functions
import upload from "../middleware/multer.middleware.js";
import { searchLimiter,productLimiter } from "../middleware/ratelimitor.middleware.js";
import {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  addProduct
} from "../controllers/product.controller.js";
import { addProductSchema, validateRequest } from "../validators/product.validator.js";
import express from "express";

const router = express.Router();

router.get("/", searchLimiter,getAllProducts);
router.get("/search",searchLimiter ,searchProducts);
router.get("/category/:category",getProductsByCategory);
router.get("/:id", getProductById);

// 🛠️ Add product with image upload + validation
router.post(
  "/",
  productLimiter,
  upload.array("images", 5),
  validateRequest(addProductSchema),
  addProduct
);

export default router;