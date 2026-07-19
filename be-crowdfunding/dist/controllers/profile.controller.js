"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const response_1 = require("../utils/response");
const profile_service_1 = require("../services/profile.service");
const campaign_service_1 = require("../services/campaign.service");
class ProfileController {
    constructor() {
        this.profileService = new profile_service_1.ProfileService();
        this.GetProfile = this.GetProfile.bind(this);
        this.UpdateProfile = this.UpdateProfile.bind(this);
        this.DeleteProfile = this.DeleteProfile.bind(this);
        this.CampaignService = new campaign_service_1.CampaignService();
        this.GetMyCampaigns = this.GetMyCampaigns.bind(this);
    }
    async GetMyCampaigns(req, res) {
        var _a;
        try {
            const userKey = (_a = req.user) === null || _a === void 0 ? void 0 : _a.Key;
            if (!userKey) {
                return res
                    .status(401)
                    .json((0, response_1.newErrorResponse)("User not authenticated or Key not found in token"));
            }
            // Panggil service campaign untuk mendapatkan data
            const campaigns = await this.CampaignService.getCampaignsByOwner(userKey);
            res
                .status(200)
                .json((0, response_1.newSuccessResponse)("User campaigns retrieved successfully", campaigns));
        }
        catch (error) {
            res.status(500).json((0, response_1.newErrorResponse)("Error retrieving user campaigns"));
        }
    }
    async GetProfile(req, res) {
        try {
            const userId = req.user.id;
            const result = await this.profileService.getProfile(userId);
            if (!result) {
                res.status(404).json((0, response_1.newErrorResponse)("Profile not found"));
                return;
            }
            res
                .status(200)
                .json((0, response_1.newSuccessResponse)("Profile retrieved successfully", result));
        }
        catch (error) {
            console.error("Error retrieving profile:", error);
            res.status(500).json((0, response_1.newErrorResponse)("Error retrieving profile"));
        }
    }
    async UpdateProfile(req, res) {
        try {
            const { id } = req.params;
            const body = req.body;
            if (!req.file) {
                res.status(400).json({ message: "Image is required" });
                return;
            }
            const imagePath = req.file.path; // Path gambar lengkap dari Cloudinary
            const result = await this.profileService.updateProfile(id, {
                ...body,
                Image: imagePath,
            });
            if (!result) {
                res
                    .status(404)
                    .json((0, response_1.newErrorResponse)(`Profile with ID ${id} not found`));
                return;
            }
            res
                .status(200)
                .json((0, response_1.newSuccessResponse)("Profile updated successfully", result));
        }
        catch (error) {
            console.error("Error updating profile:", error);
            res.status(500).json((0, response_1.newErrorResponse)("Error updating profile"));
        }
    }
    async DeleteProfile(req, res) {
        try {
            const userId = req.user.id;
            const result = await this.profileService.deleteProfile(userId);
            if (!result) {
                res
                    .status(404)
                    .json((0, response_1.newErrorResponse)(`Profile with ID ${userId} not found`));
                return;
            }
            res.status(200).json((0, response_1.newSuccessResponse)("Profile deleted successfully"));
        }
        catch (error) {
            console.error("Error deleting profile:", error);
            res.status(500).json((0, response_1.newErrorResponse)("Error deleting profile"));
        }
    }
}
exports.ProfileController = ProfileController;
