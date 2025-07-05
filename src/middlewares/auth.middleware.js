import { User } from "../modules/user.Model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  console.log("Received Token:", token); // 🔍

  if (!token) {
    throw new ApiError(401, "Access token missing");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SCERATE);
    console.log("Decoded Token:", decodedToken); // 🔍
  } catch (err) {
    console.error("JWT Verification Error:", err.message); // 🔍
    throw new ApiError(401, "Invalid or expired access token");
  }

  const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(401, "User not found with this token");
  }

  req.user = user;
  next();
});

