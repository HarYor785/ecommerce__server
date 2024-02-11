import mongoose from "mongoose";

const resetPasswordSchem = new mongoose.Schema({
    userId: {type: String, unique: true},
    email: {type: String, unique: true},
    token: {type: String},
    createdAt: Date,
    expiredAt: Date
})

const PasswordReset = new mongoose.model("PasswordReset", resetPasswordSchem)

export default PasswordReset