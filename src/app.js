import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

//  allow cros policy
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
// set json lenght limit
app.use(express.json({
    limit: "16kb"
}))
// config url properties
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))
// use for, storing some specific files (image, *file, song) in localy
app.use(express.static("public"))

//  use for, perform CRED operation on cookies
app.use(cookieParser())

// routes import
import userRouter from './routes/user.routes.js'

// routes declaration
app.use("/api/v1/users", userRouter)





export { app }