import multer from "multer";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Gunakan memory storage karena kita akan memproses dengan sharp dan upload ke cloudinary via stream
const storage = multer.memoryStorage();
const upload = multer({ storage });

const processImage = async (req: any, res: any, next: any) => {
  if (!req.file) {
    return next();
  }

  try {
    // Proses gambar di memori
    const processedBuffer = await sharp(req.file.buffer)
      .resize(600, 250) // Resize ke 600x250px
      .toFormat("jpeg")
      .jpeg({ quality: 80 })
      .toBuffer();

    // Upload ke Cloudinary melalui stream
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "bayfund", format: "jpeg" },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ message: "Image upload failed." });
        }
        
        // Simpan secure URL dari Cloudinary ke req.file.path
        req.file.filename = result.public_id;
        req.file.path = result.secure_url;
        req.file.mimetype = "image/jpeg";
        next();
      }
    );

    // Kirim buffer ke stream Cloudinary
    uploadStream.end(processedBuffer);
  } catch (error) {
    console.error("Error processing image:", error);
    return res.status(500).json({ message: "Image processing failed." });
  }
};

export { upload, processImage };