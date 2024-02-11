import express from "express"
import { changePassword, forgotPassword, login, 
    passwordLink, register, verification } from "../Controllers/authController.js"

const router = express.Router()

router.post('/register', register)
router.post('/verify', verification)
router.post('/login', login)
router.post("/forgot-password", forgotPassword)
router.get("/password-link/:userId/:token", passwordLink)
router.post("/change-password", changePassword)

export default router