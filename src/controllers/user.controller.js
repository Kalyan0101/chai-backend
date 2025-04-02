import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return {accessToken, refreshToken}

    } catch (error) {
        // console.log(error);
        throw new ApiError(500, error.message)
        // throw new ApiError(500, "something went wrong while generating Refresh and Access token!!!")
    }
}

const registerUser = asyncHandler(async (req, res) => {    

    const { userName, fullName, email, password } = req.body

    if(
        [userName, email, fullName, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
      $or: [ { userName }, { email } ]
    });

    if(existedUser) throw new ApiError(409, "User with email or userName already exists!" );
    
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    //  checkingg for coverImage file
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    //  check if avatarImage file is present, ortherwise throw error
    if(!avatarLocalPath) throw new ApiError(400, "Avatar file is required!");
    
    // upload images to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : "";

    // check if avatar file is successfully uploaded or not
    if(!avatar) throw new ApiError(400, "Avatar file is required!");

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName?.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) throw new ApiError(500, "Something went Wrong while registering the user!")

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Register Successfully.")
    ) 
})

const loginUser = asyncHandler(async (req, res) => {

    // extract data from req body
    const { email, userName, password } = req.body    

    // check if email and userName both are present or not
    if(!userName && !email) throw new ApiError(400, "username or email is required!");

    // find if user is exists with provided userName or email
    const user = await User.findOne({ 
        $or: [{ userName }, { email }]
    })

    // throw error if user not found
    if(!user) throw new ApiError(404, "User does not  exists!");
    
    // user found now check provided password is valid or not
    const isPasswordValid = await user.isPasswordCorrect(password);
    
    // throw error if password not valid
    if(!isPasswordValid) throw new ApiError(401, "Invalid user credentials!")
    
    // generate access and refresh token to login the user
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    
    // extra DB call to update the user object with freshly added access and refresh tokens
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // define options for securely manage cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    // return response and also set the secure cookies to the browser
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, 
                accessToken, 
                refreshToken
            },
            "User logged In Successfully."
        )
    )
});

const logoutUser = asyncHandler( async (req, res) => {

    // updating user object in DB, auth middleware provideing the "user" object
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            // it ensure the newly crafted object get passed if required
            new: true
        }
    )

    // same as login user but it clear the secure cookies
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));    
})

// refresh token endpoint
const refreshAccessToken = asyncHandler(async (req, res) => {

    // collect refresh token from cookies or body
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    //  throw error if refresh token not available
    if(!refreshAccessToken) throw new ApiError(401, "Unauthorised request!!!")

    try {
        //  decode the refresh token
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        //  find that particular user based on id extract from refresh token
        const user = await User.findById(decodedToken?._id);
    
        // throw error if user not found
        if(!user) throw new  ApiError(401, "Invalid Refresh Token!!!");
    
        // compare collected Refresh Token with the saved one on DB, throw error if not matched
        if(user?.refreshToken !== incomingRefreshToken) throw new ApiError(401, "Refresh Token is expair or used!!!");
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        // generate new refresh and access token for the user
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user?._id);
    
        // crafted response
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(
            200,
            { 
                accessToken,
                newRefreshToken
            },
            "Access token refreshed."
        ))
    } catch (error) {
        throw new ApiError(400, error?.message || "invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect) throw new ApiError(400, "Invalid old password!!!")

    user.password = newPassword;

    await user.save({ validateBeforeSave: false })

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully."));
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "current user fetched successfully."
     ));
})

const updateAccountDetails = asyncHandler(async ( req, res) => {
    const { fullName, email } = req.body;

    if(!fullName && !email) throw new ApiError(400, "All fields are required");

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email,
            }
        },
        { new: true }
    ).select("-password");

    return res
    .status(200)
    .json(new ApiError(200, user, "Account details updated successfully"));
})

const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath) throw new ApiError(400, "Error: Avatar file is missing!!!");

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url) throw new ApiError(400, "Error: while uploading avatar!!!")
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password");

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        user,
        "Avatar updated successfully."
    ));
})

const updateUserCoverImage = asyncHandler(async (req, res) => {

    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath) throw new ApiError(400, "Error: cover image file is missing!!!");

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url) throw new ApiError(400, "Error: while uploading cover image!!!")
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password");

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        user,
        "Cover image updated successfully."
    ));
})

export { 
    registerUser, 
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
}

/*
    1. get user details from frontend
    2. validate user data
    3. check if user alredy exists: userName, email
    4. check for images, check for avatar
    5. upload them to cloudinary, avatar
        - unlink / delete file from local storage
    6. create user object - create entry in db
    7. remove password and refresh token field from response
    8. check for user creation
    9. return response
*/

/*
    req body -> data > username, password
    username, email
    find the user
    check password
    generate access and refresh token
    refresh token saved into database
    send cookie
*/