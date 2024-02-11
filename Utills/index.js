import bcryptjs from "bcryptjs"
import Jwt from "jsonwebtoken"
import crypto from "crypto"


export const hashString = async (value)=>{
    const salt = await bcryptjs.genSalt(10)
    const hashed = await bcryptjs.hash(value, salt)
    return hashed 
}

export const compareString = async (value, defaultValue)=>{
    const result = await bcryptjs.compare(value, defaultValue)
    return result
}

export const generateToken = (id,role)=>{
    return Jwt.sign({userId: id, role: role}, process.env.JWT_SECRET_KEY, {expiresIn: "1d"})
}

export const generateVerificationCode = ()=>{
    return crypto.randomBytes(4).toString("hex").toUpperCase()
}