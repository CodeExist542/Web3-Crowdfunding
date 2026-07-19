import { Request, Response } from "express";
import { IUsers } from "../models/userModel";
import { newErrorResponse, newSuccessResponse } from "../utils/response";
import { PaymentService } from "../services/payment.service";
import { IPayments } from "../models/paymentModel";

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();

    this.GetPayment = this.GetPayment.bind(this);
    this.CreatePayment = this.CreatePayment.bind(this);
    this.UpdatePayment = this.UpdatePayment.bind(this);
    this.DeletePayment = this.DeletePayment.bind(this);
  }

  async GetPayment(req: Request, res: Response) {
    try {
      const result = await this.paymentService.getPayments();

      if (!result) {
        res.status(404).json(newErrorResponse("Payment not found"));
        return;
      }

      res
        .status(200)
        .json(newSuccessResponse("Payment retrieved successfully", result));
    } catch (error) {
      console.error("Error retrieving Payment:", error);
      res.status(500).json(newErrorResponse("Error retrieving Payment"));
    }
  }

  async CreatePayment(req: Request, res: Response): Promise<void> {
    try {
      const body: IPayments = req.body;

      const result = await this.paymentService.createPayment({
        ...body,
      });

      if (!result) {
        res
          .status(400)
          .json(newErrorResponse(`Cannot get donation ${body.DonationID}`));
        return;
      }

      res.status(201).json(newSuccessResponse("Payment created successfully"));
    } catch (error) {
      console.log(error);

      res.status(500).json(newErrorResponse("Error creating payment"));
    }
  }

  async UpdatePayment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const body: IPayments = req.body;

      const result = await this.paymentService.updatePayment(id, {
        ...body,
      });
      if (!result) {
        res
          .status(403)
          .json(newErrorResponse(`Pament with ID ${body._id} not found`));
        return;
      }

      res.status(200).json(newSuccessResponse("Update user succesfully"));
    } catch (error) {
      res.status(500).json(newErrorResponse("Error updated user"));
    }
  }

  async DeletePayment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.paymentService.deletePayment(id);

      if (!result) {
        res
          .status(404)
          .json(newErrorResponse(`Payment with ID ${id} not found`));
        return;
      }

      res.status(200).json(newSuccessResponse("Payment deleted successfully"));
    } catch (error) {
      console.error("Error deleting Payment:", error);
      res.status(500).json(newErrorResponse("Error deleting Payment"));
    }
  }
}
