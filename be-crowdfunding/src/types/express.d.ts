import { Request } from "express";
import { Multer } from "multer";
declare module "express" {
  export interface Request {
    user?: {
      id: string;
      email: string;
    };
  }

  export interface CustomRequest extends Request {
    file?: Multer.File; // Optional file property
  }
}
