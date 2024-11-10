// authMiddleware.js
import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    const token = req.cookies.accessToken;  // Access token from cookie

    if (!token) {
        return res.status(401).json({ message: "Authorization token required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.adminId = decoded._id;  // Attach decoded admin ID to the request
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};
