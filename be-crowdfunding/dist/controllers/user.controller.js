"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const response_1 = require("../utils/response");
const user_service_1 = require("../services/user.service");
const abi_1 = require("../ABI/abi");
const ethers_1 = require("ethers");
class UserController {
    constructor() {
        this.userService = new user_service_1.UserService();
        this.contractAddress = `${process.env.CONTRACT_ADDRESS}`;
        this.abi = abi_1.campaignABI;
        this.provider = new ethers_1.ethers.providers.JsonRpcProvider(`${process.env.INFURA_KEY}`);
        this.signer = new ethers_1.ethers.Wallet(`${process.env.PRIVATE_KEY}`);
        this.contract = new ethers_1.ethers.Contract(this.contractAddress, this.abi, this.signer);
        this.LoginUser = this.LoginUser.bind(this);
        this.ConnectWallet = this.ConnectWallet.bind(this);
        this.DisconnectWallet = this.DisconnectWallet.bind(this);
        this.GetAllUsers = this.GetAllUsers.bind(this);
        this.CreateUser = this.CreateUser.bind(this);
        this.UpdateUser = this.UpdateUser.bind(this);
        this.DeleteUser = this.DeleteUser.bind(this);
    }
    async GetAllUsers(req, res) {
        try {
            const result = await this.userService.getAllUser();
            if (!result) {
                res.status(400).json((0, response_1.newErrorResponse)("User not found"));
                return;
            }
            res.status(200).json((0, response_1.newSuccessResponse)("User get successfully", result));
        }
        catch (error) {
            res.status(500).json((0, response_1.newErrorResponse)("Error get all users"));
        }
    }
    async LoginUser(req, res) {
        try {
            const body = req.body;
            // Panggil service, yang sekarang kita tahu akan mengembalikan token (string) atau null
            const token = await this.userService.loginUser({
                ...body,
            });
            // Jika service mengembalikan null, berarti email/password salah
            if (!token) {
                res.status(401).json((0, response_1.newErrorResponse)("Invalid email or password"));
                return;
            }
            // Jika berhasil, langsung kirim token yang didapat dari service
            res.status(200).json((0, response_1.newSuccessResponse)("Login successful", { token }));
        }
        catch (error) {
            console.log(error);
            res.status(500).json((0, response_1.newErrorResponse)("Error logging in user"));
        }
    }
    async CreateUser(req, res) {
        try {
            const body = req.body;
            const result = await this.userService.createUser({
                ...body,
            });
            if (!result) {
                res
                    .status(400)
                    .json((0, response_1.newErrorResponse)(`User with Email ${body.Name} already exist`));
                return;
            }
            res.status(201).json((0, response_1.newSuccessResponse)("User created successfully"));
        }
        catch (error) {
            console.log(error);
            res.status(500).json((0, response_1.newErrorResponse)("Error creating user"));
        }
    }
    async ConnectWallet(req, res) {
        var _a;
        try {
            const contractAddress = this.contractAddress;
            const abi = this.abi;
            const provider = this.provider;
            const signer = this.signer.connect(provider);
            const contract = new ethers_1.ethers.Contract(contractAddress, abi, signer);
            const body = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                res.status(401).json((0, response_1.newErrorResponse)("Unauthorized"));
                return;
            }
            if (!body.WalletAddress) {
                res.status(400).json({ message: "Wallet address is required" });
                return;
            }
            const existingUser = await this.userService.getOneUser({ _id: userId });
            if (!existingUser) {
                res.status(404).json((0, response_1.newErrorResponse)("User not found"));
                return;
            }
            // ✅ Panggil service untuk connect wallet & update database
            const user = await this.userService.connectWallet({
                Email: existingUser.Email,
                WalletAddress: body.WalletAddress,
            });
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            const gasPrice = await provider.getGasPrice();
            // ✅ Panggil Smart Contract untuk menyimpan user di blockchain
            const tx = await contract.registerUser(body.WalletAddress.toString(), existingUser.Name ? existingUser.Name.toString() : "", existingUser.Email ? existingUser.Email.toString() : "", {
                gasLimit: ethers_1.ethers.utils.hexlify(500000),
                maxPriorityFeePerGas: ethers_1.ethers.utils.hexlify(gasPrice.mul(2)),
                maxFeePerGas: ethers_1.ethers.utils.hexlify(gasPrice.mul(3)),
            });
            res
                .status(201)
                .json((0, response_1.newSuccessResponse)("User connect wallet successfully", user));
        }
        catch (error) {
            console.log("Error", error);
            res.status(500).json((0, response_1.newErrorResponse)(error.message || "Error connect wallet user"));
        }
    }
    async DisconnectWallet(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                res.status(401).json((0, response_1.newErrorResponse)("Unauthorized"));
                return;
            }
            const existingUser = await this.userService.getOneUser({ _id: userId });
            if (!existingUser) {
                res.status(404).json((0, response_1.newErrorResponse)("User not found"));
                return;
            }
            const user = await this.userService.disconnectWallet({
                Email: existingUser.Email,
                WalletAddress: existingUser.WalletAddress,
            });
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            res
                .status(201)
                .json((0, response_1.newSuccessResponse)("User disconnect wallet successfully", user));
        }
        catch (error) {
            console.log("Error", error);
            res.status(500).json((0, response_1.newErrorResponse)(error.message || "Error disconnect wallet user"));
        }
    }
    async UpdateUser(req, res) {
        try {
            const { id } = req.params;
            const body = req.body;
            const result = await this.userService.updateUser(id, {
                ...body,
            });
            if (!result) {
                res
                    .status(403)
                    .json((0, response_1.newErrorResponse)(`User with name ${body.Name} not found`));
                return;
            }
            res.status(200).json((0, response_1.newSuccessResponse)("Update user succesfully"));
        }
        catch (error) {
            res.status(500).json((0, response_1.newErrorResponse)("Error updated user"));
        }
    }
    async DeleteUser(req, res) {
        try {
            const { id } = req.params;
            const result = await this.userService.deleteUser(id);
            if (!result) {
                res.status(403).json((0, response_1.newErrorResponse)(`User with _id ${id} not found`));
            }
            res.status(200).json((0, response_1.newSuccessResponse)("Delete user succesfully"));
        }
        catch (error) {
            res.status(500).json((0, response_1.newErrorResponse)("Error delete user"));
        }
    }
}
exports.UserController = UserController;
