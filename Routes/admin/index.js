import express from "express"
import { changePassword, deleteProfile, fetchProfile, getProfiles, 
    login, signup, updateProfile,} from "../../Controllers/adminAuthContoller.js"
import authMiddleware from "../../Middlewares/authMiddleware.js"

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.put('/update', authMiddleware, updateProfile)
router.post('/change-password/:userId?', changePassword)
router.get('/profiles/', authMiddleware, getProfiles)
router.get('/profile/:id', authMiddleware, fetchProfile)
router.delete('/profile/delete/:id', authMiddleware, deleteProfile)


export default router