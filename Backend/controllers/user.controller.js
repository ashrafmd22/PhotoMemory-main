import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utility/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import path from 'path';
import fs from 'fs';

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    return res.status(400).json({ message: "Invalid" });
  }
};

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  if ([username, email, password].some((field) => field?.trim() === "")) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  const user = await User.create({
    username,
    email,
    password,
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    return res.status(500).json({ message: "User registration failed" });
  }

  return res.status(201).json({ status: "ok" });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }

  const user = await User.findOne({email});
  if (!user) {
    return res.status(404).json({ message: "User does not exist" });
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  //for production code include below one
  // const options = { httpOnly: true,secure:true};

  //tesing
  const options={httpOnly:true};

  return res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .json({ user: loggedInUser, accessToken, refreshToken });
};

const logoutUser = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );
  const options = { httpOnly: true };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
};

const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    return res.status(401).json({ message: "Unauthorized request" });
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const options = { httpOnly: true, secure: true, sameSite: "strict" };
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({ message: "Access token refreshed" });
  } catch (error) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

const changeCurrentPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Invalid old password" });
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json({ message: "Password changed successfully" });
};

const getCurrentUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // Assuming the user object is already populated by verifyJWT middleware
  res.status(200).json({ user: req.user, authenticated: true });
};

const imageUpload = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required' });
  }

  const imageLocalPath = req.file.path; // Assuming req.file.path contains the local file path

  try {
    const imageResult = await uploadOnCloudinary(imageLocalPath);
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.images.push(imageResult.url);
    await user.save();

    // Remove the local file after successful upload
    fs.unlink(imageLocalPath, (err) => {
      if (err) console.error('Error deleting local image file:', err);
    });

    return res.status(200).json({
      message: 'Image uploaded and saved successfully',
      imageUrl: imageResult.url,
    });
  } catch (error) {
    console.error('Error uploading image to Cloudinary or updating user', error);
    return res.status(500).json({
      message: 'Failed to upload image or update user record',
    });
  }
};

const allimages=async(req,res)=>{
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const user = await User.findById(req.user?._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const images = user.images;
  return res.status(200).json({
    message: 'Images retrieved successfully',
    images: images,
  });
}
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  imageUpload,
  allimages
};
