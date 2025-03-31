import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFileName) => {
    try {
        if (!localFileName) return null;

        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFileName, {
            resource_type: "auto",
        });

        // file has been uploaded successfully
        console.log("file is uploaded on cloudinary", response);
        return response;
    }
    catch (error) {
        fs.unlinkSync(localFileName);    // remove locally saved file
        return null;
    }
    // finally{
    // }
};

export { uploadOnCloudinary }