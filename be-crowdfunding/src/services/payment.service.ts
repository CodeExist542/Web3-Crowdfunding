import { FilterQuery, Model, Types } from "mongoose";
import { IPayments, PaymentModel } from "../models/paymentModel";
import { IDonations, DonationModel } from "../models/donationModel";

export class PaymentService {
  private PaymentModel: Model<IPayments>;
  private DonationModel: Model<IDonations>;

  constructor() {
    this.PaymentModel = PaymentModel;
    this.DonationModel = DonationModel;
  }

  async generateKey() {
    const result = await this.PaymentModel.findOne({
      Key: { $exists: true },
    }).sort({ Key: -1 });

    if (result && result.Key) {
      return result.Key + 1;
    }

    return 1;
  }

  async getOnePayment(
    filter: FilterQuery<IPayments>
  ): Promise<IPayments | null> {
    return await this.PaymentModel.findOne(filter);
  }

  async getPayments(): Promise<IPayments[]> {
    try {
      const result = await this.PaymentModel.find({});
      return result;
    } catch (error) {
      console.error("Error retrieving Payments:", error);
      throw error;
    }
  }

  async createPayment(body: IPayments): Promise<IPayments | null> {
    try {
      const donation = await this.DonationModel.findOne({
        Key: body.DonationID,
      });

      if (!donation) {
        return null;
      }
      const key = await this.generateKey();

      const newUser = new this.PaymentModel({ ...body, Key: key });

      const savedUser = await newUser.save();

      return savedUser;
    } catch (error) {
      throw error;
    }
  }

  async updatePayment(id: string, body: IPayments) {
    try {
      const data = await this.PaymentModel.findOne({
        _id: id,
      });
      if (!data) {
        return null;
      }

      body.Updated_at = new Date();

      const result = await this.PaymentModel.findByIdAndUpdate(
        { _id: id },
        {
          ...body,
        },
        { new: true }
      ).exec();

      return result;
    } catch (error) {
      throw error;
    }
  }

  async deletePayment(userId: string) {
    try {
      const data = await this.PaymentModel.findOne({ _id: userId });
      if (!data) {
        return null;
      }

      const result = await this.PaymentModel.findByIdAndUpdate(
        { _id: userId },
        {
          isDeleted: true,
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { new: true }
      ).exec();

      return result;
    } catch (error) {
      throw error;
    }
  }
}
