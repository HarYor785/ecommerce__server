import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    price: {
        type: String,
        required: [true, "Price is required"],
    },
    shippingFee: {
        type: String,
        required: [true, "Shipping fee is required"],
    },
    slug: {
        type: String,
    },
    description: {
        type: String,
    },
    shortDescription: {
        type: String,
    },
    discountedPrice: {
        type: String,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Category is required"],
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category.subCategory",
        required: [true, "Sub Category is required"],
    },
    collections: {
        type: String
    },
    images: [{
        type: String
    }],
    stock: {
        type: Number,
        default: 0,
    },
    rating: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
    },
    tags: {
        type: [String],
        enum: ['Deal of the day', 'New arrivals', 'Trending', 'Top rated', 'New products'],
        default: ["New products"],
    },
    status: {
        type: String,
        enum: ['Published','Schedule','Hidden'],
        default: "Published",
    },
},{timestamps: true})

const Product = new mongoose.model("Product", productSchema)

export default Product