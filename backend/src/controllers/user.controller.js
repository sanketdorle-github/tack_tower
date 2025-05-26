import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asynHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Register a new user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const response = new ApiResponse(
    201,
    {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    "User registered successfully"
  );

  res.status(response.statusCode).json(response);
});

// Login a user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "Invalid credentials");
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(400, "Invalid credentials");
  }

  // Generate token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  const response = new ApiResponse(
    200,
    {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    },
    "Login successful"
  );

  res

    .status(response.statusCode)
    .cookie("token", token, {
      httpOnly: true,

      maxAge: 24 * 60 * 60 * 1000, // 1 days
    })
    .json(response);
});

// Get current user's profile
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const response = new ApiResponse(200, user, "User profile fetched");
  res.status(response.statusCode).json(response);
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0), // Immediately expire the cookie
    sameSite: "lax", // Adjust if needed for your front-end setup
  });

  const response = new ApiResponse(200, null, "Logged out successfully");
  res.status(response.statusCode).json(response);
});


//update profiles

// Update user profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.id; // From auth middleware

  // Validate input
  if (!name || !email) {
    throw new ApiError(400, "Name and email are required");
  }

  // Find and update user
  const user = await User.findByIdAndUpdate(
    userId,
    { 
      $set: { 
        name,
        email 
      } 
    },
    { 
      new: true, // Return updated document
      runValidators: true // Run model validators
    }
  ).select("-password"); // Exclude password field

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Generate new token if email was changed (optional)
  let token;
  if (email !== req.user.email) {
    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Set new cookie if token was regenerated
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
  }

  const responseData = {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    ...(token && { token }) // Include new token only if generated
  };

  const response = new ApiResponse(
    200,
    responseData,
    "Profile updated successfully"
  );

  res.status(response.statusCode).json(response);
});

export { registerUser, loginUser, getUserProfile, logoutUser };
