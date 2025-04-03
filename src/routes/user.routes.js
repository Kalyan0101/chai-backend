import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
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
router.route("/get-user").post(verifyJWT, getCurrentUser);

router
    .route("/update-details")
    .post(upload.none(), verifyJWT, updateAccountDetails); 
    // NOTE: if want to send data as form-data by postman we have to use any middleware(multer or body-parser) othwise use raw format

router
    .route("/update-avatar")
    .post(upload.single("avatar"), verifyJWT, updateUserAvatar);

router
    .route("/update-cover-image")
    .post(upload.single("coverImage"), verifyJWT, updateUserCoverImage);
export default router;
