import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import compression from "compression"
import xssClean from "xss-clean"
import dotenv from "dotenv"
import mongoSanitize from "express-mongo-sanitize"

import errorMiddleware from "./Middlewares/errorMiddleware.js"
import dbConnection from "./DbConfig/index.js"
import router from "./Routes/index.js"


dotenv.config()

const app = express()

const PORT = process.env.PORT || 8000

app.use(cors())
app.use(helmet())
app.use(xssClean())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(compression())
app.use(express.urlencoded({extended: true}))
app.use(express.json({limit: "10mb"}))
app.use(mongoSanitize())

app.use(morgan("dev"))

app.use(router)


dbConnection()

app.use(errorMiddleware)

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})