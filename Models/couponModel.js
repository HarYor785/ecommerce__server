import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, "Code is required"],
        unique: true,
    },
    type:{
        type: String
    },
    discount: {
        type: String,
        required: [true, "Discount is required"],
    },
    limit:{
        type: Number,
        min: 0,
        max: 500,
    },
    registered: {
        type: String,
    },
    status: {
        type: String,
    },
    startDate: {
        type: String,
        required: [true, "Start date is required"],
    },
    endDate: {
        type: String,
        required: [true, "End date is required"],
    },
},{timestamps: true})

const Coupon = new mongoose.model("Coupon", couponSchema)

export default Coupon