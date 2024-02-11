import Accounts from "../Models/accountModel.js"
import PasswordReset from "../Models/passwordResetModel.js";
import { compareString, generateToken, 
    generateVerificationCode, hashString } from "../Utills/index.js"
import { sendForgotPasswordMail, sendMail } from "../Utills/mailer.js"

const token = generateVerificationCode();

export const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
    
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
            success: false,
            message: "All fields are required",
            });
        }
    
        // Validate email format using a regular expression
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
            success: false,
            message: "Invalid email format",
            });
        }
    
        // Check if the user already exists
        const existingUser = await Accounts.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
            success: false,
            message: "User already exists",
            });
        }
    
        const hash = await hashString(password);
        const newUser = new Accounts({
            firstName,
            lastName,
            email,
            password: hash,
            verificationCode: token,
        });
    
        await newUser.save();
        // Send code for verification
        const isMailSent = await sendMail(email, token);
        if (!isMailSent) {
            return res.status(500).json({
            success: false,
            message: "Failed to send verification code",
            });
        }
    
        res.status(201).json({
            success: true,
            message: "User created successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
        }
};

export const verification = async (req, res)=>{
    try {
        const {email,token} = req.body
        const user = await Accounts.findOne({email})
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }
        if (user.verificationCode!== token) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification code"
            })
        }

        user.verify = true
        await user.save()
        res.status(200).json({
            success: true,
            message: "User verified successfully"
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export const login = async (req, res)=>{
    try {
        const {email, password} = req.body
        const user = await Accounts.findOne({email})
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }
        if(!user.verify){
            return res.status(400).json({
                success: false,
                message: "User not verified"
            })
        }
        const isMatch = await compareString(password, user.password)
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid password"
            })
        }
        const token = generateToken(user._id)

        user.password = undefined

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user,
            token
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export const forgotPassword = async (req, res)=>{
    try {
        const {email} = req.body
        const user = await Accounts.findOne({email})

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }
        if(!user.verify){
            return res.status(400).json({
                success: false,
                message: "User not verified"
            })
        }

        const existingPasswordReset = await PasswordReset.findOne({email})

        if (existingPasswordReset) {
            if(existingPasswordReset.expiredAt > Date.now()){
                return res.status(400).json({
                    success: false,
                    message: "Password reset link already sent"
                })
            }

            await PasswordReset.findOneAndDelete({email})

        }

        await sendForgotPasswordMail(user, res)

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export const passwordLink = async (req, res)=>{
    try {
        const {userId, token} = req.params

        const password = await PasswordReset.findOne({userId})

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        const {expiredAt, token: hashToken} = password

        if(expiredAt < Date.now()){
            return res.status(400).json({
                success: false,
                message: "Password reset link expired"
            })
        }else{
            const isMatch = await compareString(token, hashToken)
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid token"
                })
            }else{
                res.status(200).json({
                    success: true,
                    id: userId
                })
            }
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export const changePassword = async (req, res)=>{
    try {
        const {id, password} = req.body
        const user = await Accounts.findById(id)
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        const hash = await hashString(password)

        const updateUser = await Accounts.findByIdAndUpdate({_id: id},{password: hash})
        
        if(updateUser){
            await PasswordReset.findOneAndDelete({userId: id})
            res.status(200).json({
                success: true,
                message: "Password changed successfully"
            })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}