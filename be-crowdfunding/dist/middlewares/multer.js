"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processImage = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Gunakan memory storage karena kita akan memproses dengan sharp dan upload ke cloudinary via stream
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
exports.upload = upload;
const processImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }
    try {
        // Proses gambar di memori
        const processedBuffer = await (0, sharp_1.default)(req.file.buffer)
            .resize(600, 250) // Resize ke 600x250px
            .toFormat("jpeg")
            .jpeg({ quality: 80 })
            .toBuffer();
        // Upload ke Cloudinary melalui stream
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({ folder: "bayfund", format: "jpeg" }, (error, result) => {
            if (error || !result) {
                console.error("Cloudinary upload error:", error);
                return res.status(500).json({ message: "Image upload failed." });
            }
            // Simpan secure URL dari Cloudinary ke req.file.path
            req.file.filename = result.public_id;
            req.file.path = result.secure_url;
            req.file.mimetype = "image/jpeg";
            next();
        });
        // Kirim buffer ke stream Cloudinary
        uploadStream.end(processedBuffer);
    }
    catch (error) {
        console.error("Error processing image:", error);
        return res.status(500).json({ message: "Image processing failed." });
    }
};
exports.processImage = processImage;
