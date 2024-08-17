import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected DB 127.0.0.1:${connectionInstance.connection.port}`);
        
    }catch(error){
        console.log('ERROR: connection Error: ', error);
        process.exit(1);

    }
}

export default connectDB