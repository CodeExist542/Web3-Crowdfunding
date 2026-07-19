"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const campaign_controller_1 = require("../controllers/campaign.controller");
const donation_controller_1 = require("../controllers/donation.controller");
const authenticateToken_1 = __importDefault(require("../middlewares/authenticateToken"));
const profile_controller_1 = require("../controllers/profile.controller");
const multer_1 = require("../middlewares/multer");
const payment_controller_1 = require("../controllers/payment.controller");
const router = express_1.default.Router();
const privateKey = process.env.PRIVATE_KEY || ""; // Ambil private key dari .env
const userController = new user_controller_1.UserController();
const campaignController = new campaign_controller_1.CampaignController();
const donationController = new donation_controller_1.DonationController(privateKey);
const profileController = new profile_controller_1.ProfileController();
const paymentController = new payment_controller_1.PaymentController();
// User Routes
router.post("/users/login", userController.LoginUser);
router.post("/users/connect-wallet", authenticateToken_1.default, userController.ConnectWallet);
router.post("/users/disconnect-wallet", authenticateToken_1.default, userController.DisconnectWallet);
router.get("/users", userController.GetAllUsers);
router.post("/users", userController.CreateUser);
router.put("/users/:id", userController.UpdateUser);
router.delete("/users/:id", userController.DeleteUser);
// Campaign Routes
router.get("/campaigns", campaignController.GetAllCampaigns);
router.get("/campaigns/:id", campaignController.GetAllCampaignsById);
router.post("/campaigns", authenticateToken_1.default, multer_1.upload.single("Image"), multer_1.processImage, campaignController.CreateCampaign);
router.put("/campaigns/:id", campaignController.UpdateCampaign);
router.post("/campaigns/cancel", authenticateToken_1.default, campaignController.CancelCampaign);
router.delete("/campaigns/:id", campaignController.DeleteCampaign);
// Donation Routes
router.post("/donations", authenticateToken_1.default, donationController.CreateDonation);
router.post("/donations/withdraw", authenticateToken_1.default, donationController.WithdrawDonation);
router.post("/donations/refund", authenticateToken_1.default, donationController.RefundDonation);
//Profile Routes
router.get("/profile", authenticateToken_1.default, profileController.GetProfile);
router.put("/profile/:id", multer_1.upload.single("Image"), multer_1.processImage, profileController.UpdateProfile);
// ✅ UBAH BARIS DI BAWAH INI
router.get('/profile/campaigns', authenticateToken_1.default, profileController.GetMyCampaigns // <-- Ganti menjadi profileController
);
router.delete("/profile/:id", authenticateToken_1.default, profileController.DeleteProfile);
router.get("/payments", paymentController.GetPayment);
router.post("/payments", paymentController.CreatePayment);
router.put("/payments/:id", paymentController.UpdatePayment);
router.delete("/payments/:id", paymentController.DeletePayment);
exports.default = router;
