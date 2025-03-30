import express, { json } from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// accept json data
app.use(express.json({ 
    limit: "16kb" 
}))

// accept data over url
app.use(express.urlencoded({ 
    extended: true, 
    limit: "16kb"
}))

// store data locally
app.use(express.static("public"))
// for set cookies on client browser
app.use(cookieParser())


// routes import

import userRouter from "./routes/user.routes.js";


//  routes declaration

app.use("/api/v1/users", userRouter)


export { app }