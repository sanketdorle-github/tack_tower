import { v2 as cloudinary } from "cloudinary";

import fs from "fs";
import { loadEnvFile } from "process";

//configuration.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilepath) => {
  try {
    //if the local file path is not available then return null means that while uploading on local something happened cause the problem.
    if (!localFilepath) return null;
    const resposnse = await cloudinary.uploader.upload(localFilepath, {
      resource_type: "auto",
    });
    // console.log("uplaoded sucessfully");

    //after the file upload on cloudinary
    fs.unlinkSync(localFilepath); // remove the locally saved temporary file as the upload operation got failed

    return resposnse;
  } catch (error) {
    //if any error on cloudinary side cause the file uplaod to failed then this unlinked the file and return null
    fs.unlinkSync(localFilepath); // remove the locally saved temporary file as the upload operation got failed
    console.log("uplaoding  failed", error);

    return null;
  }
};

export { uploadOnCloudinary };
