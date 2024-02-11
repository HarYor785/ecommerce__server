import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    guestUser:{
        identifier:{
            type: String,
        }
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product is required"],
        },
        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
        }
    }],
    totalAmount: {
        type: Number,
        required: [true, "Total is required"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
},{timestamps: true})

const Cart = new mongoose.model("Cart", cartSchema)

export default Cart