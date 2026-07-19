"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// Schema untuk User
const userSchema = new mongoose_1.Schema({
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
    const user = this;
    if (user.isModified("Password")) {
        const salt = await bcrypt_1.default.genSalt(10);
        user.Password = await bcrypt_1.default.hash(user.Password, salt);
    }
    next();
});
// Middleware: Update `updated_at` saat data diperbarui
userSchema.pre("findOneAndUpdate", function (next) {
    this._update.updated_at = new Date();
    next();
});
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt_1.default.compare(enteredPassword, this.Password);
};
exports.UserModel = mongoose_1.default.model("User", userSchema);
