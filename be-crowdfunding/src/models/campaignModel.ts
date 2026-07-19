import mongoose, { Schema, Types } from "mongoose";

// Interface untuk Campaign
export interface ICampaigns {
  _id: Types.ObjectId;
  OwnerID: string;
  Title: string;
  Description: string;
  TargetAmount: number;
  CurrentAmount?: number;
  Image: string;
  Deadline: Date;
  Status: string;
  Key?: number;
  isDeleted: boolean;
  Created_at: Date;
  Updated_at: Date;
  Deleted_at?: Date;
}

// Schema untuk Campaign
const CampaignSchema = new Schema<ICampaigns>({
  OwnerID: {
    type: String,
    required: true,
  },
  Title: {
    type: String,
    required: true,
  },
  Description: {
    type: String,
    required: true,
  },
  TargetAmount: {
    type: Number,
    required: true,
  },
  CurrentAmount: {
    type: Number,
    required: false,
    default: 0,
  },
  Image: {
    type: String, // 🖼️ Menyimpan path gambar
    required: true,
  },
  Deadline: {
    type: Date,
    required: true,
  },
  Status: {
    type: String,
    required: true,
  },
  Key: {
    type: Number,
    required: true,
    unique: true,
  },
  isDeleted: {
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

// Model untuk Campaign
export const CampaignModel = mongoose.model<ICampaigns>(
  "Campaign",
  CampaignSchema
);
