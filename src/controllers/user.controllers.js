import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { APiResponse } from "../utils/ApiResponse.js"

const regesterUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation data - not empty
    // check if user already exits: username, email
    // check for images, check for avatar
    // upload them to coludinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response


    const {fullName, email, username, password} = req.body
    console.log(fullName);
    console.log(email);

    // if (fullName === "") {
    //     throw new ApiError(400, "Fullname is required")
    // }
    
    if (
        [fullName, email, username, password].some( (field) => 
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = User.findOne({
        $or: [{ userName }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with or username already exists.")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0].path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required.");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required.");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()        
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refereshToken"
    )

    if (!createdUser) {
       throw new ApiError(500, "Something went wrong while regestring the user.");
    }

    return res.status(201).json(
        new APiResponse(200, createdUser, "User registered successfully.")
    )

} )

export { regesterUser }