import Jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next)=>{
    const authHeader = req?.headers?.authorization

    if(!authHeader || !authHeader.startsWith("Bearer")){
        return res.status(401).json({success: false,message: "Authorization failed"})
    }
    const token = authHeader.split(" ")[1]

    try{
        const decoded = Jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.body.user = {
            userId: decoded.userId
        }
        next()
    }catch(err){
        res.status(401).json({success: false,message: "Authorization failed"})
    }
}

export default authMiddleware