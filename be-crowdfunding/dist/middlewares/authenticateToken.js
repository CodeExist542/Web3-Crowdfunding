"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// ✅ 3. Gunakan IRequestWithUser sebagai tipe untuk 'req'
const authenticateToken = (req, res, next) => {
    var _a;
    const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Access denied. No token provided." });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "default_secret");
        if (typeof decoded === "object" && "id" in decoded && "email" in decoded && "Key" in decoded) {
            // ✅ Sekarang TypeScript tidak akan error karena 'req.user' sudah didefinisikan untuk menerima 'Key'
            req.user = {
                id: decoded.id,
                email: decoded.email,
                Key: decoded.Key,
            };
            next();
        }
        else {
            res.status(403).json({ message: "Invalid token structure. 'Key' is missing." });
        }
    }
    catch (error) {
        res.status(403).json({ message: "Invalid or expired token" });
    }
};
exports.default = authenticateToken;
