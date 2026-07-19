import { Request, Response } from "express";
import { IUsers } from "../models/userModel";
import { newErrorResponse, newSuccessResponse } from "../utils/response";
import { ProfileService } from "../services/profile.service";
import { CampaignService } from "../services/campaign.service";

export class ProfileController {
  private profileService: ProfileService;
  private CampaignService: CampaignService;

  constructor() {
    this.profileService = new ProfileService();

    this.GetProfile = this.GetProfile.bind(this);
    this.UpdateProfile = this.UpdateProfile.bind(this);
    this.DeleteProfile = this.DeleteProfile.bind(this);
    this.CampaignService = new CampaignService();
    this.GetMyCampaigns = this.GetMyCampaigns.bind(this);
  }
  async GetMyCampaigns(req: Request, res: Response) {
    try {
      const userKey = (req as any).user?.Key;

      if (!userKey) {
        return res
          .status(401)
          .json(
            newErrorResponse("User not authenticated or Key not found in token")
          );
      }

      // Panggil service campaign untuk mendapatkan data
      const campaigns = await this.CampaignService.getCampaignsByOwner(userKey);

      res
        .status(200)
        .json(
          newSuccessResponse("User campaigns retrieved successfully", campaigns)
        );
    } catch (error) {
      res.status(500).json(newErrorResponse("Error retrieving user campaigns"));
    }
  }
  async GetProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const result = await this.profileService.getProfile(userId);

      if (!result) {
        res.status(404).json(newErrorResponse("Profile not found"));
        return;
      }

      res
        .status(200)
        .json(newSuccessResponse("Profile retrieved successfully", result));
    } catch (error) {
      console.error("Error retrieving profile:", error);
      res.status(500).json(newErrorResponse("Error retrieving profile"));
    }
  }

  async UpdateProfile(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const body: IUsers = req.body;

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
          .json(newErrorResponse(`Profile with ID ${id} not found`));
        return;
      }

      res
        .status(200)
        .json(newSuccessResponse("Profile updated successfully", result));
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json(newErrorResponse("Error updating profile"));
    }
  }

  async DeleteProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await this.profileService.deleteProfile(userId);

      if (!result) {
        res
          .status(404)
          .json(newErrorResponse(`Profile with ID ${userId} not found`));
        return;
      }

      res.status(200).json(newSuccessResponse("Profile deleted successfully"));
    } catch (error) {
      console.error("Error deleting profile:", error);
      res.status(500).json(newErrorResponse("Error deleting profile"));
    }
  }
}
