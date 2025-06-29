import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js';
import { User } from '../modules/user.Model.js';
import { uplodeFilePath } from '../utils/Cloudnery.js';
import { ApiResponce } from '../utils/ApiResponce.js';

const registerUser = asyncHandler(async (req,res) => {
    // 1 -> Valedate User Details
    // 2 -> Cheak non of data will be Empty
    // 3 -> check if user already exist : username, email
    // 4 -> check images, check for avtar
    // 5 -> uplode them to clodnary
    // 6 -> create user object -> create fields from responce 
    // 7 -> chech for user creation
    // 8 -> return responce

    const {username,email,fullname,password} = req.body
    console.log("Email ",email);
    if(
        [username,email,fullname,password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400," full name is require")
    }

    const existUser = User.findOne({
        $or : [{username},{email}]
    })

    if(existUser){
        throw new ApiError(409," Username or email already exist")
    }

    const avtarLocalpath = req.files?.avatar[0]?.path;
    const coverLocalpath = req.files?.coverimage[0]?.path;

    if(!avtarLocalpath){
        throw new ApiError(400, " Avatar file is required")
    }

    const avatar = await uplodeFilePath(avtarLocalpath)
    const coverImage = await uplodeFilePath(coverLocalpath)

    if(!avatar){
        throw new ApiError(400, " An error occer during uploding avatar")
    }

    const user = await User.create({
        fullname,
        avatar : avatar.url,
        coverImage : coverImage.url,
        email,
        password,
        username : username.toLowerCase()
    })

    const createUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createUser){
        throw ApiError(500, " Something went wrong while regestring user")
    }

    return res.status(201).json(
        new ApiResponce(200,createUser,"User registered Successfully")
    )
})

export {
    registerUser
} 