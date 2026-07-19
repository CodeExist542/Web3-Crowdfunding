"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const connection = `${process.env.DATABASE_URL}/${process.env.DATABASE_NAME}`;
const options = {
    autoIndex: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMs: 5000,
    socketTimeoutMS: 45000,
    family: 4,
};
const db = mongoose_1.default
    .connect(connection, options)
    .then((ress) => {
    console.log("DB: ", db);
    if (ress) {
        console.log(`Database connection successfully connected!`);
    }
})
    .catch((err) => {
    console.log(err);
});
exports.default = db;
