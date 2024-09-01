import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from 'dotenv';
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) throw new Error('Local file path is required');
    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    });
    console.log("File uploaded on Cloudinary", response.url);
    return response;
  } catch (error) {
    console.log("here buddy")
    console.error("Error uploading file:", error);
    if (localFilePath) {
      fs.unlinkSync(localFilePath); // Remove the locally saved temporary file as the upload operation failed
    }
    return null;
  }
};

export { uploadOnCloudinary };
