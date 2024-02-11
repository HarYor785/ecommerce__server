import mongoose, {Schema} from "mongoose";

const addressSchema = new Schema({
    street: {
        type: String,
        required: [true, "Street is required"]
    },
    city: {
        type: String,
        required: [true, "City is required"]
    },
    state: {
        type: String,
        required: [true, "State is required"]
    },
    zip: {
        type: String,
        required: [true, "Zip is required"]
    },
    country: {
        type: String,
        required: [true, "Country is required"]
    },
    type: {
        type: String,
        enum: ["home", "office"],
        default: "home"
    }
})

const paymentSchema = new Schema({
    cardName: {
        type: String,
        required: [true, "Card Name is required"]
    },
    cardNumber: {
        type: String,
        required: [true, "Card number is required"],
        validate: {
            validator: (value)=> creditCard.validate(value).card,
            message: "Invalid card number"
        }
    },
    expirationDate: {
        type: String,
        required: [true, "Expiration date required is required"],
        validate: {
            validator: (value)=> creditCard.expiry(value).isValid,
            message: "Invalid expiration date"
        }
    },
    cvv: {
        type: String,
        required: [true, "Cvv is required"],
        validate: {
            validator: (value)=> /^\d{3,4}$/.test(value),
            message: "Invalid cvv"
        }
    },
})

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    guestUser:{
        name:{
            type: String,
            required: [true, "Guest User Name is required"],
        },
        email:{
            type: String,
            required: [true, "Guest User Email is required"],
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
    totalPrice: {
        type: Number,
        required: [true, "Total price is required"],
    },
    shippingAddress: {
        type: addressSchema,
        required: [true, "Address is required"],
    },
    paymentMethod: {
        type: paymentSchema,
        required: [true, "Payment is required"],
    },
    status: {
        type: String,
        enum: ["Pending", "Delivered", "Canceled"],
        default: "Pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
},{timestamps: true})

const Order = new mongoose.model("Order", orderSchema)

export default Order