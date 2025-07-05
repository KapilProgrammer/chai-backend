import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js';
import { User } from '../modules/user.Model.js';
import { uplodeFilePath } from '../utils/Cloudnery.js';
import { ApiResponce } from '../utils/ApiResponce.js';
import { log } from 'console';
import { ref } from 'process';
import jwt from "jsonwebtoken"

const registerUser = asyncHandler(async (req, res) => {
    // 1 -> Valedate User Details
    // 2 -> Cheak non of data will be Empty
    // 3 -> check if user already exist : username, email
    // 4 -> check images, check for avtar
    // 5 -> uplode them to clodnary
    // 6 -> create user object -> create fields from responce 
    // 7 -> chech for user creation
    // 8 -> return responce

    const { username, email, fullname, password } = req.body
    // console.log("Email ",email);
    if (
        [username, email, fullname, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, " full name is require")
    }

    const existUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existUser) {
        throw new ApiError(409, " Username or email already exist")
    }
    // console.log(req.files);

    const avtarLocalpath = req.files?.avatar[0]?.path;
    // const coverLocalpath = req.files?.coverimage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && (req.files.coverImage.length > 0)) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    if (!avtarLocalpath) {
        throw new ApiError(400, " Avatar file is required")
    }

    const avatar = await uplodeFilePath(avtarLocalpath)
    const coverImage = await uplodeFilePath(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, " An error occer during uploding avatar")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createUser) {
        throw ApiError(500, " Something went wrong while regestring user")
    }

    return res.status(201).json(
        new ApiResponce(200, createUser, "User registered Successfully")
    )
})

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw ApiError(400, "Somewnet Wring during generating token")
    }
}

const loginUser = asyncHandler(async (req, res) => {
    const {  email, username,password } = req.body
    console.log(email);
    

    if (!username && !email) {
        throw new ApiError(400, "UserName or Email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "Username or Email is Wrong")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user Credential")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponce(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in Successfully"
        )
    )
})

const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).clearCookie("accessToken",options)
                    .clearCookie("refreshToken",options)
                    .json(new ApiResponce(200,{},"User lodded Out"))
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if(incomingRefreshToken){
        throw new ApiError(400,"Unauthorize request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SCERATE)
    
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"Invalid refresh Token")
        }
    
        if(incomingRefreshToken!==user){
            throw new ApiError(401,"Refresh token is Expired or used")
        }
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
            .status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",newRefreshToken,options)
            .json(
                new ApiResponce(
                    200,
                    {accessToken,newRefreshToken},
                    "Access token refreshToken"
                )
            )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token")
    }
})

export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken
} 