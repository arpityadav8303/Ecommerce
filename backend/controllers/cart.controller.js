import {Cart} from "../modals/cart.modal.js";
import { ApiError } from "../utils/Apierrors.js";
import {Product} from "../modals/product.modal.js";
const getCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        if (!cart) {
            throw new ApiError(404, "Cart not found");
        }

        return res.status(200).json({
            success: true,
            message: "Cart fetched successfully",
            cart: {
                items: cart.items,
                totalItems: cart.items.length,
                totalPrice: cart.totalPrice || 0
            }
        });
    } catch (err) {
        throw new ApiError(500, err.message);
    }
};

const addToCart=async(req,res)=>{
    try{
        const userId=req.user._id;
        const {productId,quantity}=req.body;
        if(!productId){
           throw new ApiError(400,"Product ID is required")
        }
        if(!quantity){
            throw new ApiError(400,"Quantity is required")
        }
        if(quantity<=0){
            throw new ApiError(400,"Quantity must be greater than 0")
        }
        const product=await Product.findById(productId);
        if(!product){
            throw new ApiError(404,"Product not found")
        }
        if(product.stock<1){
            throw new ApiError(400,"Product is out of stock")
        }
        let cart=await Cart.findOne({user:userId});
        if(!cart){
            cart=new Cart({user:userId});
        }
       const existingItem = cart.items.find(
            item => item.product.toString() === productId
        );
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (product.stock < newQuantity) {
                throw new ApiError(400, `Only ${product.stock} items available`);
            }
            existingItem.quantity = newQuantity;
            existingItem.totalPrice = existingItem.price * newQuantity;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                price: product.price,
                totalPrice: product.price * quantity
            });
        }
         await cart.save();

        res.status(200).json({
            success: true,
            message: "Product added to cart successfully",
            cart
        });
    } 
    catch (err) {
        console.error("❌ Add to Cart Error:", err.message);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Internal server error"
        });
    }

}

const updateCartItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            throw new ApiError(400, "Quantity must be at least 1");
        }

        const product = await Product.findById(productId);
        if (!product) {
            throw new ApiError(404, "Product not found");
        }

        if (product.stock < quantity) {
            throw new ApiError(400, `Only ${product.stock} items available`);
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            throw new ApiError(404, "Cart not found");
        }

        const cartItem = cart.items.find(
            item => item.product.toString() === productId
        );

        if (!cartItem) {
            throw new ApiError(404, "Product not in cart");
        }

        cartItem.quantity = quantity;
        cartItem.totalPrice = cartItem.price * quantity;

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart updated successfully",
            cart
        });
    } catch (err) {
        console.error("❌ Update Cart Error:", err.message);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Internal server error"
        });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            throw new ApiError(404, "Cart not found");
        }

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart
        });
    } catch (err) {
        console.error("❌ Remove from Cart Error:", err.message);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Internal server error"
        });
    }
};

const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            throw new ApiError(404, "Cart not found");
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            cart
        });
    } catch (err) {
        console.error("❌ Clear Cart Error:", err.message);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Internal server error"
        });
    }
};
export {getCart,addToCart,updateCartItem,removeFromCart,clearCart}
