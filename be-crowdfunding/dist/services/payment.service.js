"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const paymentModel_1 = require("../models/paymentModel");
const donationModel_1 = require("../models/donationModel");
class PaymentService {
    constructor() {
        this.PaymentModel = paymentModel_1.PaymentModel;
        this.DonationModel = donationModel_1.DonationModel;
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
    async getOnePayment(filter) {
        return await this.PaymentModel.findOne(filter);
    }
    async getPayments() {
        try {
            const result = await this.PaymentModel.find({});
            return result;
        }
        catch (error) {
            console.error("Error retrieving Payments:", error);
            throw error;
        }
    }
    async createPayment(body) {
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
        }
        catch (error) {
            throw error;
        }
    }
    async updatePayment(id, body) {
        try {
            const data = await this.PaymentModel.findOne({
                _id: id,
            });
            if (!data) {
                return null;
            }
            body.Updated_at = new Date();
            const result = await this.PaymentModel.findByIdAndUpdate({ _id: id }, {
                ...body,
            }, { new: true }).exec();
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async deletePayment(userId) {
        try {
            const data = await this.PaymentModel.findOne({ _id: userId });
            if (!data) {
                return null;
            }
            const result = await this.PaymentModel.findByIdAndUpdate({ _id: userId }, {
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
exports.PaymentService = PaymentService;
