import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
    const { username, fullname, email, password } = req.body

    console.log(req.body);
    console.log(req.files);   


    // if(fullname === ""){
    //     throw new ApiError(400, "Fullname is required")
    // }

    if(
        [username, email, fullname, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = User.findOne({
      $or: [ { username }, { email } ]
    });
    if(existedUser) throw new ApiError(409, "User with email or username already exists!" );

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath) throw new ApiError(400, "Avatar file is required!");
    
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) throw new ApiError(400, "Avatar file is required!");

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) throw new ApiError(500, "Comething went Wrong while registering the user!")

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Register Successfully.")
    ) 
})


export { registerUser }

/*
    1. get user details from frontend
    2. validate user data
    3. check if user alredy exists: username, email
    4. check for images, check for avatar
    5. upload them to cloudinary, avatar
        - unlink / delete file from local storage
    6. create user object - create entry in db
    7. remove password and refresh token field from response
    8. check for user creation
    9. return response
*/