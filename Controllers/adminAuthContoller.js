// adminSignupController.js
import Product from "../Models/ProductModel.js";
import Accounts from "../Models/accountModel.js";
import Store from "../Models/storeModel.js"
import Order from "../Models/orderModel.js";
import { compareString, generateToken, hashString } from "../Utills/index.js";

export const signup = async (req, res) => {

    try {
        const { userName, email, password, secretKey } = req.body;

        if (!userName || !email || !password || !secretKey) {
        return res.status(400).json({
            success: false,
            message: "All fields are required",
        });
        }

        // Validate secretKey and determine user role
        let role = '';
        const adminKey = process.env.ADMIN_SECRET_KEY;
        const staffKey = process.env.STAFF_SECRET_KEY;
        const root = process.env.ROOT_SECRET_KEY;

        if (secretKey === adminKey) {
            role = 'Admin';
        } else if (secretKey === staffKey) {
            role = 'Staff';
        } else if (secretKey === root) {
            role = 'Root';
        } else {
            return res.status(403).json({
                success: false,
                message: "Invalid secret key",
            });
        }

        const existingUser = await Accounts.findOne({ email });
        if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "User already exists",
        });
        }

        const hash = await hashString(password);
        const user = new Accounts({
        userName,
        email,
        password: hash,
        role: role,
        verify: true,
        verificationCode: secretKey
        });

        await user.save();
        user.password = undefined
        user.verificationCode = undefined
        
        // Generate a JWT token for admin
        const token = generateToken(user._id, user.role)

        res.status(201).json({
        user,
        token,
        success: true,
        message: "Admin created successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
        success: false,
        message: error.message,
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required",
        });
        }

        const user = await Accounts.findOne({ email });

        if (!user || !(await compareString(password, user.password))) {
        return res.json({
            success: false,
            message: "Invalid credentials",
        });
        }

        if(user.status === 'Blocked'){
            return res.status(403).json({
                success: false,
                message: `This account has been blocked by the administrator`,
            })
        }

        user.password = undefined
        user.verificationCode = undefined
        // Generate a JWT token for admin
        const token = generateToken(user?._id, user.role)

        res.status(200).json({
        user,
        success: true,
        token,
        message: "Admin logged in successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
        success: false,
        message: error.message,
        });
    }
};

export const updateProfile = async (req, res)=>{
    try {
        const {userId} = req.body.user
        const {firstName,lastName,userName,email,role,status,
            department,dob,gender,mobile,postalCode,address,city,
            state,country,avatarUrl
        } = req.body
        const checkUser = await Accounts.findById(userId)
        if(!checkUser){
            res.json({
                success:false,
                message:"No User Found!"
            })
        }
        const newData = {_id: userId,firstName,lastName,userName,email,role,status,
            department,dob,gender,mobile,avatar: avatarUrl,
            address:[{
                firstName,lastName,city,state,address,country,postalCode,
            }]
        }
        const update = await Accounts.findByIdAndUpdate(userId,newData,{
            new:true
        })
        const token = generateToken(update._id, update.role)
        update.password = undefined
        update.verificationCode = undefined

        res.status(200).json({
            success: true,
            user: update,
            message: 'Profile updated successfuly',
            token
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

export const changePassword = async (req, res)=>{
    const userId = req.params.userId
    const {oldPassword, newPassword, secretKey} = req.body;
    try {
        let checkUser;
        if(userId !== undefined && userId !== "undefined" && userId !== ''){
            checkUser = await Accounts.findById(userId)
        }else{
            checkUser = await Accounts.findOne({verificationCode: secretKey})
        }
        
        if (!checkUser) {
            return res.status(401).json({
                success: false,
                message: "User not found or incorrect secret key"
            })
        }
        const adminKey = process.env.ADMIN_SECRET_KEY;
        const staffKey = process.env.STAFF_SECRET_KEY;
        const root = process.env.ROOT_SECRET_KEY;

        //Checking the old Password
        const validPass = await compareString(oldPassword , checkUser.password);
        if (!validPass) {
            return res.status(401).json({
                success: false,
                message: "Invalid Old Password"
            })
        }

        let user;

        const encryptedNewPassword = await hashString(newPassword)
        if (secretKey !== '' && secretKey === adminKey 
        || secretKey === staffKey || secretKey === root) {
            user = await Accounts.findOneAndUpdate({verificationCode: secretKey}, {
                $set:{
                    password: encryptedNewPassword
                }
            },{new:true});

        } else{
            user = await Accounts.findByIdAndUpdate(userId, {
                $set:{
                    password: encryptedNewPassword
                }
            },{new:true});
        }

        res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request",
        });
    }
}

export const getProfiles = async (req, res)=>{
    try {
        const {userId} = req.body.user
        const profile = await Accounts.findById(userId)
        if(profile){
            const accounts = await Accounts.find().select('-verificationCode')
            res.status(200).json({
                success: true,
                data: accounts
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:false,
            message:"An error occurred while processing your request"
        })
    }
}

export const fetchProfile = async (req, res)=>{
    try {
        const {id} = req.params
        const {userId} = req.body.user
        const verifyUser = await Accounts.findById(userId)
        if(!verifyUser){
            return res.status(401).json({
                success: false,
                message: "Unauthorized User!"
            })
        }
        const profile = await Accounts.findById(id)
        .populate({
            path: 'orders',
            model: Order, 
        })
        .populate({
            path: 'products',
            model: Product,
        })

        profile.verificationCode = undefined
        res.status(200).json({
            success: true,
            data: profile
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:false,
            message:"An error occurred while processing your request"
        })
    }
}

export const deleteProfile = async (req, res)=>{
    try {
        const {id} = req.params
        const {userId} = req.body.user
        const user = await Accounts.findById(userId)
        if(!user){
            return res.status(401).json({
                success: false,
                message:"Authorization failed"
            })
        }

        const profile = await Accounts.findByIdAndDelete(id)
        // Delete all related orders and products to the account
        // for(let i=0;i<profile.orders.length;i++){
        //     let orderId = profile.orders[i]._id
        //     await Order.findOneAndRemove({_id : orderId})
        // }
        if(!profile){
            res.status(400).json({
                success:false,
                message:'The specified profile does not exist'
            })
        }
        res.status(200).json({
            success:true,
            message:'Account has been deleted'
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request."
        })
    }
}

