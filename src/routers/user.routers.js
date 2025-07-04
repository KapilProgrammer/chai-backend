import { Router } from "express";
import {loginUser, logOutUser, registerUser,refreshAccessToken} from "../Controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1,
        },
        {
            name : "converimage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

// Sceoured routes
router.route("/logout").post(verifyJWT ,logOutUser)

router.route("/refresh-token").post(refreshAccessToken)

export default router