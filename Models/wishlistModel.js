import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product is required"],
        },
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
},{timestamps: true})

const Wishlist = new mongoose.model("Wishlist", wishlistSchema)

export default Wishlist