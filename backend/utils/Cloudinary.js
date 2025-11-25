import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // Use secure_url (always present)
    console.log("✅ File uploaded successfully:", response.secure_url);

    // Delete temp file after upload
    const absolutePath = path.resolve(localFilePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log("🗑️ Temp file deleted:", absolutePath);
    }

    return response;
  } catch (error) {
    console.error("❌ Upload failed:", error.message);

    // Cleanup on error
    const absolutePath = path.resolve(localFilePath);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
        console.log("🗑️ Temp file deleted after failure:", absolutePath);
      } catch (unlinkError) {
        console.log("⚠️ Could not delete temp file:", unlinkError.message);
      }
    }

    // Return a structured error response
    return {
      error: true,
      message: `Failed to upload image: ${path.basename(localFilePath)}`,
    };
  }
};

export { uploadOnCloudinary };