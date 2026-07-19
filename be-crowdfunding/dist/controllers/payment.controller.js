"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const response_1 = require("../utils/response");
const payment_service_1 = require("../services/payment.service");
class PaymentController {
    constructor() {
        this.paymentService = new payment_service_1.PaymentService();
        this.GetPayment = this.GetPayment.bind(this);
        this.CreatePayment = this.CreatePayment.bind(this);
        this.UpdatePayment = this.UpdatePayment.bind(this);
        this.DeletePayment = this.DeletePayment.bind(this);
    }
    async GetPayment(req, res) {
        try {
            const result = await this.paymentService.getPayments();
            if (!result) {
                res.status(404).json((0, response_1.newErrorResponse)("Payment not found"));
                return;
            }
            res
                .status(200)
                .json((0, response_1.newSuccessResponse)("Payment retrieved successfully", result));
        }
        catch (error) {
            console.error("Error retrieving Payment:", error);
            res.status(500).json((0, response_1.newErrorResponse)("Error retrieving Payment"));
        }
    }
    async CreatePayment(req, res) {
        try {
            const body = req.body;
            const result = await this.paymentService.createPayment({
                ...body,
            });
            if (!result) {
                res
                    .status(400)
                    .json((0, response_1.newErrorResponse)(`Cannot get donation ${body.DonationID}`));
                return;
            }
            res.status(201).json((0, response_1.newSuccessResponse)("Payment created successfully"));
        }
        catch (error) {
            console.log(error);
            res.status(500).json((0, response_1.newErrorResponse)("Error creating payment"));
        }
    }
    async UpdatePayment(req, res) {
        try {
            const { id } = req.params;
            const body = req.body;
            const result = await this.paymentService.updatePayment(id, {
                ...body,
            });
            if (!result) {
                res
                    .status(403)
                    .json((0, response_1.newErrorResponse)(`Pament with ID ${body._id} not found`));
                return;
            }
            res.status(200).json((0, response_1.newSuccessResponse)("Update user succesfully"));
        }
        catch (error) {
            res.status(500).json((0, response_1.newErrorResponse)("Error updated user"));
        }
    }
    async DeletePayment(req, res) {
        try {
            const { id } = req.params;
            const result = await this.paymentService.deletePayment(id);
            if (!result) {
                res
                    .status(404)
                    .json((0, response_1.newErrorResponse)(`Payment with ID ${id} not found`));
                return;
            }
            res.status(200).json((0, response_1.newSuccessResponse)("Payment deleted successfully"));
        }
        catch (error) {
            console.error("Error deleting Payment:", error);
            res.status(500).json((0, response_1.newErrorResponse)("Error deleting Payment"));
        }
    }
}
exports.PaymentController = PaymentController;
