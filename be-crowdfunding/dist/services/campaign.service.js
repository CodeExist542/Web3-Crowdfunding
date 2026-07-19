"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const campaignModel_1 = require("../models/campaignModel");
class CampaignService {
    constructor() {
        this.CampaignModel = campaignModel_1.CampaignModel;
    }
    async generateKey() {
        const result = await this.CampaignModel.findOne({
            Key: { $exists: true },
        }).sort({ Key: -1 });
        if (result && result.Key) {
            return result.Key + 1;
        }
        return 1;
    }
    async getOneCampaign(filter) {
        const category = await this.CampaignModel.findOne(filter);
        return category;
    }
    async getAllCampaign() {
        try {
            const result = await this.CampaignModel.find();
            if (!result) {
                return null;
            }
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async getCampaignsByOwner(ownerId) {
        try {
            if (!ownerId) {
                throw new Error("Owner ID is required");
            }
            // Cari semua campaign yang cocok dengan OwnerID, urutkan dari yang terbaru
            const campaigns = await this.CampaignModel.find({
                OwnerID: ownerId,
            }).sort({ Created_at: -1 });
            return campaigns;
        }
        catch (error) {
            console.error("Error fetching campaigns by owner:", error);
            throw error;
        }
    }
    async getCampaignById(id) {
        try {
            if (!id) {
                throw new Error("ID is required");
            }
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                throw new Error("Invalid campaign ID format");
            }
            const campaign = await this.CampaignModel.aggregate([
                {
                    $match: { _id: new mongoose_1.default.Types.ObjectId(id) }, // Cari campaign berdasarkan real _id
                },
                {
                    $lookup: {
                        from: "users",
                        let: { ownerID: "$OwnerID" }, // Ambil OwnerID dari campaign
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$Key", { $toInt: "$$ownerID" }], // Cocokkan Key di users dengan OwnerID yang dikonversi ke angka
                                    },
                                },
                            },
                            {
                                $project: {
                                    _id: 1,
                                    Name: 1,
                                    Email: 1,
                                    Key: 1,
                                    WalletAddress: 1,
                                },
                            }, // Pilih hanya field yang diperlukan
                        ],
                        as: "Owner",
                    },
                },
                {
                    $unwind: { path: "$Owner", preserveNullAndEmptyArrays: true }, // Pastikan tidak menghapus campaign jika owner tidak ditemukan
                },
            ]);
            if (!campaign || campaign.length === 0) {
                throw new Error("Campaign not found");
            }
            return campaign[0]; // Ambil elemen pertama karena hasil aggregate berupa array
        }
        catch (error) {
            console.error("Error fetching campaign by ID:", error);
            throw error;
        }
    }
    async getCampaign(ownerId) {
        try {
            const pipeline = [
                {
                    $lookup: {
                        from: "users",
                        let: { ownerIdStr: { $toString: "$OwnerID" } },
                        pipeline: [
                            {
                                $addFields: {
                                    keyString: { $toString: "$key" },
                                },
                            },
                            {
                                $match: {
                                    $expr: { $eq: ["$keyString", "$$ownerIdStr"] },
                                },
                            },
                        ],
                        as: "Owner",
                    },
                },
                { $unwind: "$Owner" },
                {
                    $project: {
                        _id: 1,
                        Title: 1,
                        Description: 1,
                        key: 1,
                        TargetAmount: 1,
                        CurrentAmount: 1,
                        Deadline: 1,
                        Status: 1,
                        Owner: {
                            Name: "$Owner.Name",
                            Email: "$Owner.Email",
                            WalletAddress: "$Owner.WalletAddress",
                        },
                    },
                },
            ];
            // 🟢 Tambahkan Filter Berdasarkan OwnerID Jika Diberikan
            if (ownerId) {
                pipeline.unshift({ $match: { OwnerID: ownerId } });
            }
            const result = await this.CampaignModel.aggregate(pipeline);
            return result;
        }
        catch (error) {
            console.error("Error fetching campaigns:", error);
            throw new Error("Failed to fetch campaign data");
        }
    }
    async getFilteredCampaigns(options) {
        try {
            // Ambil semua options dengan nilai default
            const { limit = 6, sort = "-Created_at", page = 1, search = "", } = options;
            // 2. Buat objek filter dinamis
            const filter = {};
            // 3. Tambahkan logika pencarian ke dalam filter jika 'search' ada isinya
            if (search) {
                filter.Title = { $regex: search, $options: "i" };
            }
            // --- Logika Sorting (sudah benar, kita rapikan sedikit) ---
            const sortObj = {};
            const sortField = sort.startsWith("-") ? sort.substring(1) : sort;
            const sortOrder = sort.startsWith("-") ? -1 : 1;
            sortObj[sortField] = sortOrder;
            const offset = (page - 1) * limit;
            // 4. Gunakan objek 'filter' dalam query find()
            const campaigns = await this.CampaignModel.find(filter)
                .sort(sortObj)
                .skip(offset)
                .limit(limit)
                .select("_id Title Description TargetAmount Image CurrentAmount Deadline Status Created_at");
            // 5. PERBAIKAN KRUSIAL: Gunakan objek 'filter' juga saat menghitung total dokumen
            const total = await this.CampaignModel.countDocuments(filter);
            return { campaigns, total };
        }
        catch (error) {
            // Melempar error agar bisa ditangkap oleh controller
            throw error;
        }
    }
    async createCampaign(body) {
        try {
            const campaign = await this.CampaignModel.findOne({
                Title: body.Title,
                OwnerID: body.OwnerID,
            });
            if (campaign) {
                // Jika campaign sudah ada, kembalikan null atau error sesuai kebutuhan
                return null;
            }
            const key = await this.generateKey();
            const newCampaign = new this.CampaignModel({ ...body, Key: key });
            return await newCampaign.save();
        }
        catch (error) {
            throw error;
        }
    }
    async updateCampaign(id, body) {
        try {
            const data = await this.CampaignModel.findOne({
                _id: id,
            });
            if (!data) {
                return null;
            }
            body.Updated_at = new Date();
            const result = await this.CampaignModel.findByIdAndUpdate({ _id: id }, {
                ...body,
            }, { new: true }).exec();
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async updateStatusCampaign(CampaignID, Status) {
        try {
            // Cek apakah CampaignID valid
            if (!CampaignID) {
                console.error("🚨 Error: CampaignID is missing");
                return false;
            }
            // Cek apakah campaign dengan `key` yang diberikan ada di database sebelum update
            const campaignBeforeUpdate = await campaignModel_1.CampaignModel.findOne({
                Key: CampaignID,
            });
            if (!campaignBeforeUpdate) {
                console.error(`🚨 Error: No campaign found with key ${CampaignID}`);
                return false;
            }
            // Proses update CurrentAmount dengan $inc
            const updateResult = await campaignModel_1.CampaignModel.updateOne({ Key: CampaignID }, { $set: { Status: Status } });
            return true;
        }
        catch (error) {
            console.error("🚨 Error in updateOneCampaign:", error);
            throw error;
        }
    }
    async updateOneCampaign(CampaignID, Amount) {
        try {
            // Cek apakah CampaignID valid
            if (!CampaignID) {
                console.error("🚨 Error: CampaignID is missing");
                return false;
            }
            // Cek apakah Amount valid
            if (typeof Amount !== "number" || isNaN(Amount) || Amount <= 0) {
                console.error("🚨 Error: Invalid Amount value", Amount);
                return false;
            }
            // Cek apakah campaign dengan `key` yang diberikan ada di database sebelum update
            const campaignBeforeUpdate = await campaignModel_1.CampaignModel.findOne({
                Key: CampaignID,
            });
            if (!campaignBeforeUpdate) {
                console.error(`🚨 Error: No campaign found with key ${CampaignID}`);
                return false;
            }
            // Proses update CurrentAmount dengan $inc
            const updateResult = await campaignModel_1.CampaignModel.updateOne({ Key: CampaignID }, { $inc: { CurrentAmount: Amount } });
            // Cek apakah update berhasil dengan mengambil kembali data dari database
            const campaignAfterUpdate = await campaignModel_1.CampaignModel.findOne({
                Key: CampaignID,
            });
            if (updateResult.modifiedCount === 0) {
                console.error(`🚨 Error: Campaign update failed for key ${CampaignID}`);
                return false;
            }
            // Sync status with Smart Contract logic: If target reached, set status to Completed
            if (campaignAfterUpdate &&
                campaignAfterUpdate.CurrentAmount !== undefined &&
                campaignAfterUpdate.TargetAmount !== undefined &&
                campaignAfterUpdate.CurrentAmount >= campaignAfterUpdate.TargetAmount) {
                await campaignModel_1.CampaignModel.updateOne({ Key: CampaignID }, { $set: { Status: "Completed" } });
            }
            return true;
        }
        catch (error) {
            console.error("🚨 Error in updateOneCampaign:", error);
            throw error;
        }
    }
    async deleteCampaign(id) {
        try {
            const data = await this.CampaignModel.findOne({ _id: id });
            if (!data) {
                return null;
            }
            const result = await this.CampaignModel.findByIdAndUpdate({
                _id: id,
            }, {
                isDeleted: true,
                deleted_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }, {
                new: true,
            }).exec();
            return result;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.CampaignService = CampaignService;
