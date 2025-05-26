import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const headerToken = authHeader?.split(" ")[1]; // Bearer <token>
  const cookieToken = req.cookies?.token;

  const token = headerToken || cookieToken;
  if (!token) {
    return res.status(401).json({ message: "No token, access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded will have { userId: ... }

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export { authMiddleware };
