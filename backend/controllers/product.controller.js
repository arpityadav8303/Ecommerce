import { Product } from "../modals/product.modal.js"

// ============ GET ALL PRODUCTS ============
// This function gets all products from database
export const getAllProducts = async (req, res) => {
    try {
        // Find all products in database collection
        const products = await Product.find()
        
        // Check if products exist and array is not empty
        if (!products || products.length === 0) {
            // Send error response if no products found
            return res.status(404).json({ message: "No products found" })
        }

        // Send success response with all products
        res.status(200).json({
            message: "Products retrieved successfully",
            count: products.length, // Total number of products
            products: products // Array of all products
        })

    } catch (err) {
        // Log error to console for debugging
        console.log(err)
        // Send error response to client
        res.status(500).json({ message: "Internal server error" })
    }
}

// ============ GET PRODUCT BY ID ============
// This function gets a single product using its ID
export const getProductById = async (req, res) => {
    try {
        // Extract ID from URL parameters (e.g., /products/:id)
        const { id } = req.params

        // Find product with matching ID in database
        const product = await Product.findById(id)

        // Check if product exists in database
        if (!product) {
            // Send error if product not found
            return res.status(404).json({ message: "Product not found" })
        }

        // Send success response with the product
        res.status(200).json({
            message: "Product retrieved successfully",
            product: product // Single product object
        })

    } catch (err) {
        // Log error to console
        console.log(err)
        // Send error response
        res.status(500).json({ message: "Internal server error" })
    }
}

// ============ GET PRODUCTS BY CATEGORY ============
// This function gets all products in a specific category
export const getProductsByCategory = async (req, res) => {
    try {
        // Extract category name from URL (e.g., /category/:category)
        const { category } = req.params

        // Check if category is provided
        if (!category) {
            // Send error if category is missing
            return res.status(400).json({ message: "Category is required" })
        }

        // Find all products matching the category
        // $regex: searches for pattern (case-insensitive search)
        // $options: "i" means ignore case (SHOES = shoes = Shoes)
        const products = await Product.find({ 
            category: { $regex: category, $options: "i" } 
        })

        // Check if any products found in this category
        if (!products || products.length === 0) {
            // Send error if no products in category
            return res.status(404).json({ 
                message: `No products found in category: ${category}` 
            })
        }

        // Send success response with category products
        res.status(200).json({
            message: `Products in ${category} category retrieved successfully`,
            count: products.length, // Number of products in category
            products: products // Array of products in category
        })

    } catch (err) {
        // Log error to console
        console.log(err)
        // Send error response
        res.status(500).json({ message: "Internal server error" })
    }
}

// ============ SEARCH PRODUCTS BY KEYWORD ============
// This function searches for products by name, brand, or description
export const searchProducts = async (req, res) => {
    try {
        // Extract search keyword from query (e.g., ?keyword=nike)
        const { keyword } = req.query

        // Check if keyword is provided
        if (!keyword) {
            // Send error if no keyword provided
            return res.status(400).json({ message: "Search keyword is required" })
        }

        // Search products in multiple fields (name, description, brand)
        // $or: search in any of these fields
        // $regex: pattern matching
        // $options: "i" means case-insensitive (ignore upper/lower case)
        const products = await Product.find({
            $or: [
                // Search in product name field
                { name: { $regex: keyword, $options: "i" } },
                // OR search in description field
                { description: { $regex: keyword, $options: "i" } },
                // OR search in brand field
                { brand: { $regex: keyword, $options: "i" } }
            ]
        })

        // Check if any products match the search
        if (!products || products.length === 0) {
            // Send error if no products match search
            return res.status(404).json({ 
                message: `No products found matching: ${keyword}` 
            })
        }

        // Send success response with search results
        res.status(200).json({
            message: `Search results for "${keyword}"`,
            count: products.length, // Number of matching products
            products: products // Array of matching products
        })

    } catch (err) {
        // Log error to console
        console.log(err)
        // Send error response
        res.status(500).json({ message: "Internal server error" })
    }
}