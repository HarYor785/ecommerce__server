import mongoose, {Schema} from "mongoose";
import validator from "validator";
import creditCard from "creditcard"


const addressSchema = new Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    address: {
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
    postalCode: {
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
    type: {
        type: String,
        required: [true, "Type is required"]
    },
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

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    userName: {
        type: String,
        required: [true, "Username is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        validate: validator.isEmail
    },
    password: {
        type: String,
        required: true,
        minLength: [8, "Password must be more than 8 characters"],
        select: true
    },
    role: {
        type: String,
        enum: ["User", "Admin", "Staff", "Root"],
        default: "User"
    },
    status: {
        type: String,
        enum: ["Active", "Blocked"],
        default: "Active"
    },
    department: {
        type: String,
    },
    avatar: {type: String},
    dob: {type: String},
    gender: {type: String},
    verificationCode: { type: String },
    mobile: {type: String},
    address: [addressSchema],
    payment: [paymentSchema],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    }],
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],
    coupons: [{type: String}],
    verify: {type: Boolean, default: false}
},
{timestamps: true}
)


const Accounts = new mongoose.model("Account", userSchema)

export default Accounts