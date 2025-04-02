import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

// verify the access token
export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // first extract access token from cookie or from request header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        // check if access token is authorized or not
        if(!token) throw new ApiError(401, "Unauthorized request!");
    
        // then decode the token and extract payload from it
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        // now re-craft the user object, remove password and refresh token
        const user = await User.findById(decodedToken?._id)?.select("-password, -refreshToken");
    
        // check is there any user available or not
        if(!user) throw new ApiError(401, "Invalid Access Token!");
    
        // append a new object to the request body
        req.user = user;
    
        // then pass to next
        next();
        
    } catch (error) {
        console.log(error);        
        throw new ApiError(401, error?.message || "invalid access token");
    }
})