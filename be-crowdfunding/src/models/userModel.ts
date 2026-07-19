import mongoose, { Schema, Types } from "mongoose";
import bcrypt from "bcrypt";

// Interface untuk User
export interface IUsers {
  _id: Types.ObjectId;
  Name: string;
  Key?: number;
  Email?: string;
  Role?: "user" | "admin";
  Password: string;
  Image?: string;
  WalletAddress?: string | null;
  isDeleted: boolean;
  isConnected: boolean;
  Created_at: Date;
  Updated_at: Date;
  Deleted_at?: Date;
}

// Schema untuk User
const userSchema = new Schema<IUsers>({
  Name: {
    type: String,
    required: true,
    trim: true,
  },
  Key: {
    type: Number,
    trim: true,
  },
  Email: {
    type: String,
    required: false,
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Masukkan email yang valid",
    ],
  },
  Role: {
    type: String,
    required: true,
    enum: ["user", "admin"],
    default: "user",
  },
  Image: {
    type: String, // 🖼️ Menyimpan path gambar
    unique: true,
  },
  Password: {
    type: String,
    required: true,
    minlength: 6,
  },
  WalletAddress: {
    type: String,
    default: null,
    unique: true,
    trim: true,
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
  isConnected: {
    type: Boolean,
    required: true,
    default: false,
  },
  Created_at: {
    type: Date,
    default: Date.now,
  },
  Updated_at: {
    type: Date,
    default: Date.now,
  },
  Deleted_at: {
    type: Date,
    required: false,
  },
});

// Middleware: Hash password sebelum menyimpan ke database
userSchema.pre("save", async function (next) {
  const user = this as any;
  if (user.isModified("Password")) {
    const salt = await bcrypt.genSalt(10);
    user.Password = await bcrypt.hash(user.Password, salt);
  }
  next();
});

// Middleware: Update `updated_at` saat data diperbarui
userSchema.pre("findOneAndUpdate", function (next) {
  (this as any)._update.updated_at = new Date();
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.Password);
};

export const UserModel = mongoose.model<IUsers>("User", userSchema);
