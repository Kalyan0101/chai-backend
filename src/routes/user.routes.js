import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchedHistory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
);

router.route("/login").post(loginUser);

// secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refreshToken").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router
    .route("/update-account")
    .patch(upload.none(), verifyJWT, updateAccountDetails); 
    // NOTE: if want to send data as form-data by postman we have to use any middleware(multer or body-parser) othwise use raw format

router
    .route("/update-avatar")
    .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

router
    .route("/update-cover-image")
    .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router.route("/profile/:userName").get(verifyJWT, getUserChannelProfile)

router.route("/watchHistory").get(verifyJWT, getWatchedHistory)

export default router;
