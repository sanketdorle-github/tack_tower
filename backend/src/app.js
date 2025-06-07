import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";
import dotenv from "dotenv";
import logger from "./utils/logger.js";

dotenv.config({
  path: "./.env",
});

const app = express();
// console.log(" process.env.CORS_ORIGIN", process.env.CORS_ORIGIN);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(logger); // Register the logger middleware

//routes import
import userRoute from "./routes/user.route.js";
import boardRoute from "./routes/board.route.js";
import listRoute from "./routes/list.route.js";
import cardRoute from "./routes/card.routes.js";

app.use("/api/v1/user", userRoute);
app.use("/api/v1/board", boardRoute);
app.use("/api/v1/list", listRoute);
app.use("/api/v1/card", cardRoute);


app.get("/check-health", (req, res) => {
  res.send("The server is working fine!!");
});

app.use(globalErrorHandler);
export { app };
