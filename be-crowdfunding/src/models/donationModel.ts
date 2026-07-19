import mongoose, { Schema, Types } from "mongoose";

// Interface untuk Donation
export interface IDonations {
  _id: Types.ObjectId;
  CampaignID: String;
  DonorID: String;
  Amount: number;
  Timestamp: Date;
  Key: number;
  Created_at: Date;
  Updated_at: Date;
  Deleted_at?: Date;
}

// Schema untuk Donation
const donationSchema = new Schema<IDonations>({
  CampaignID: {
    type: String,
    required: true,
  },
  DonorID: {
    type: String,
    required: true,
  },
  Amount: {
    type: Number,
    required: true,
  },
  Timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  Key: {
    type: Number,
    required: true,
    unique: true,
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

// Model untuk Donation
export const DonationModel = mongoose.model<IDonations>(
  "Donation",
  donationSchema
);
