import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { validateTrimmedFields } from "../utils/validate.js";
import { User } from "../models/user.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;

  validateTrimmedFields(fullName, username, email, password);

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with username or email already exists");
  }

  const avatarLocalPath =
    req.files && req.files.avatar && req.files.avatar[0]
      ? req.files.avatar[0].path
      : null;
  const coverImageLocalPath =
    req.files && req.files.coverImage && req.files.coverImage[0]
      ? req.files.coverImage[0].path
      : null;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  let avatar = "";

  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("Avatar uploaded to Cloudinary:", avatar.secure_url);
  } catch (error) {
    throw new ApiError(500, "Something went wrong while uploading avatar");
  }

  let coverImage = "";
  try {
    if (coverImageLocalPath) {
      coverImage = await uploadOnCloudinary(coverImageLocalPath);
      console.log("Cover image uploaded to Cloudinary:", coverImage.secure_url);
    }
  } catch (error) {
    throw new ApiError(500, "Something went wrong while uploading cover image");
  }

  try {
    const user = await User.create({
      fullName,
      email,
      username: username.toLowerCase(),
      password,
      avatar: avatar.secure_url,
      coverImage: coverImage ? coverImage.secure_url : "",
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering user");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, "User registered successfully", createdUser));
  } catch (error) {
    console.log("user creation failed:", error);

    if (avatar) {
      await deleteFromCloudinary(avatar.public_id);
    }

    if (coverImage) {
      await deleteFromCloudinary(coverImage.public_id);
    }

    throw new ApiError(
      500,
      "Something went wrong while registering user and images were deleted"
    );
  }
});

export { registerUser };
