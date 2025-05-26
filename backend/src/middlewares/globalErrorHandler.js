import { ApiError } from "../utils/ApiError.js";

// middlewares/globalErrorHandler.js
const globalErrorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }

  // Handle unexpected errors
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    errors: [err.message],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default globalErrorHandler;
