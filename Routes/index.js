import express from "express"
import authRoute from "./authRoute.js"
import storesRoute from "./storesRoute.js"
import adminRoute from "./admin/index.js"

const router = express.Router()

const path = "/api-v1"

router.use(`${path}/auth`, authRoute)
router.use(`${path}/store`, storesRoute)
router.use(`${path}/admin`, adminRoute)

export default router
