import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// ✅ 1. Definisikan interface untuk payload user yang kita harapkan
interface IUserPayload {
  id: string;
  email: string;
  Key: string;
}

// ✅ 2. Buat interface baru untuk Request yang menyertakan user payload kita
export interface IRequestWithUser extends Request {
  user?: IUserPayload;
}

// ✅ 3. Gunakan IRequestWithUser sebagai tipe untuk 'req'
const authenticateToken = (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Access denied. No token provided." });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    ) as JwtPayload;

    if (typeof decoded === "object" && "id" in decoded && "email" in decoded && "Key" in decoded) {
      
      // ✅ Sekarang TypeScript tidak akan error karena 'req.user' sudah didefinisikan untuk menerima 'Key'
      req.user = {
        id: decoded.id as string,
        email: decoded.email as string,
        Key: decoded.Key as string,
      };
      
      next();

    } else {
      res.status(403).json({ message: "Invalid token structure. 'Key' is missing." });
    }
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

export default authenticateToken;