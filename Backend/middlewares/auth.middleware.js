import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "Unauthorized request" });
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken._id).select("-password -refreshToken");

        if (!user) {
            return res.status(401).json({ message: "Invalid Access Token" });
        }

        req.user = user;
        next();
    } catch (error) {
        // Log the actual error for debugging purposes
        console.error("JWT verification error:", error);

        // Determine if the error is due to token expiration
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: "Access token expired" });
        }

        // For other JWT-related errors or any other exceptions
        return res.status(401).json({ message: "Invalid access token" });
    }
};
