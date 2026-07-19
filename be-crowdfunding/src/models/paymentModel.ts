import mongoose, { Schema, Types } from "mongoose";

// Interface untuk Payment
export interface IPayments {
  _id: Types.ObjectId;
  DonationID: string; // Foreign Key to Donation
  Method: string;
  Key?: string;
  isDeleted: boolean;
  Created_at: Date;
  Updated_at: Date;
  Deleted_at?: Date;
}

// Schema untuk Payment
const paymentSchema = new Schema<IPayments>({
  DonationID: {
    type: String,
    required: true,
    ref: "Donation", // Reference to the Donation collection
  },
  Method: {
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

// Model untuk Payment
export const PaymentModel = mongoose.model<IPayments>("Payment", paymentSchema);
