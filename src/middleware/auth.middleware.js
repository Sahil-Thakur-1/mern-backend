import jwt from "jsonwebtoken"

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            return res.status(401).json({ success: false, message: "Authorization header missing" });
        }
        const accessToken = authHeader.split(" ")[1];
        if (!accessToken) {
            return res.status(401).json({ success: false, message: "Access token is missing" });
        }
        const decode = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        req.user = decode;
        next();
    }
    catch (e) {
        if (e.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Access token expired" });
        } else if (e.name === "JsonWebTokenError") {
            return res.status(403).json({ success: false, message: "Token is invalid" });
        } else {
            return res.status(500).json({ success: false, message: e.message });
        }
    }
}