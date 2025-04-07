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
        console.log("file is uploaded on cloudinary");
        return response;
    }
    catch (error) {
        return null;
    }
    finally{
        fs.unlinkSync(localFileName);    // remove locally saved file
    }
};

const deleteFromCloudinary = async (file_id) => {

    console.log(file_id);
    try {
        
        const response = await cloudinary.uploader.destroy(file_id);

        console.log("Cloudinary old file deleted.");

        return response;

    } catch (error) {        
        return null;
    }
}

export { uploadOnCloudinary, deleteFromCloudinary }