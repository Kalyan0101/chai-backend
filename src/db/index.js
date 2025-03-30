import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"

const connectDB = async() => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\nMongoDB connected!!! ${connection.connection.host}`);
                
    } catch (error) {
        console.log("MONGODB error", error);
        process.exit(1);
    }
}

export default connectDB