"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const mongoose_1 = require("mongoose");
const userModel_1 = require("../models/userModel");
class ProfileService {
    constructor() {
        this.UserModel = userModel_1.UserModel;
    }
    async generateKey() {
        const result = await this.UserModel.findOne({
            Key: { $exists: true },
        }).sort({ Key: -1 });
        if (result && result.Key) {
            return result.Key + 1;
        }
        return 1;
    }
    async getOneProfile(filter) {
        return await this.UserModel.findOne(filter);
    }
    async getProfile(userId) {
        try {
            // Perbaikan query: Gunakan `findById(userId)`, bukan `{ ...body._id }`
            const result = await this.UserModel.findById(userId).select("-password");
            if (!result) {
                return null;
            }
            return result;
        }
        catch (error) {
            console.error("Error retrieving profile:", error);
            throw error;
        }
    }
    async updateProfile(userId, body) {
        try {
            // Mengubah userId menjadi ObjectId jika perlu
            const objectIdUserId = new mongoose_1.Types.ObjectId(userId);
            // Mencari data pengguna berdasarkan userId
            const data = await this.UserModel.findOne({ _id: objectIdUserId });
            if (!data) {
                return null; // Jika tidak ditemukan, kembalikan null
            }
            // Menambahkan Updated_at ke body
            body.Updated_at = new Date();
            // Hapus _id jika ada, karena _id tidak boleh diubah
            const { _id, ...updatedData } = body;
            // Mengupdate data pengguna dengan informasi yang ada di body
            const result = await this.UserModel.findByIdAndUpdate({ _id: objectIdUserId }, // Menggunakan ObjectId yang sudah dikonversi
            { ...updatedData }, // Memasukkan data baru tanpa _id
            { new: true } // Mengambil data terbaru setelah update
            ).exec();
            return result; // Mengembalikan data yang telah diperbarui
        }
        catch (error) {
            throw error; // Melempar error jika ada masalah
        }
    }
    async deleteProfile(userId) {
        try {
            const data = await this.UserModel.findOne({ _id: userId });
            if (!data) {
                return null;
            }
            const result = await this.UserModel.findByIdAndUpdate({ _id: userId }, {
                isDeleted: true,
                deleted_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }, { new: true }).exec();
            return result;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.ProfileService = ProfileService;
