import { Router } from "express";
import {
    loginUser,
    logOutUser,
    registerUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvtar,
    updateUserCoverImg,
    getUserChannelProfile,
    getWatchHistory
} from "../Controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "converimage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

// Sceoured routes
router.route("/logout").post(verifyJWT, logOutUser)

router.route("/refresh-token").post(refreshAccessToken)
router.route("/changepassword").post(verifyJWT, changeCurrentPassword)
router.route("/currentuser").get(verifyJWT, getCurrentUser)
router.route("/update-AccountDetails").patch(verifyJWT, updateAccountDetails)
router.route("/avtar").patch(verifyJWT, upload.single("avatar"), updateUserAvtar)
router.route("/cover-Image").patch(verifyJWT, upload.single("/coverImage"), updateUserCoverImg)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)

export default router