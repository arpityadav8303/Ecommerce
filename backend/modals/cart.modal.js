import mongoose from "mongoose";

const CartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                    default: 1
                },
                price: {
                    type: Number,
                    required: true
                },
                totalPrice: {
                    type: Number,
                    required: true
                }
            }
        ],
        totalItems: {
            type: Number,
            default: 0
        },
        totalPrice: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Middleware to update total before saving
CartSchema.pre("save", function (next) {
    this.totalItems = this.items.length;
    this.totalPrice = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
    next();
});

export const Cart = mongoose.model("Cart", CartSchema);