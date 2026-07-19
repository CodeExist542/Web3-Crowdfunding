"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const express_list_endpoints_1 = __importDefault(require("express-list-endpoints"));
const morgan_1 = __importDefault(require("morgan"));
const db_config_1 = __importDefault(require("./db/db.config"));
const router_1 = __importDefault(require("./routes/router"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("tiny"));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
const PORT = process.env.PORT || 5000;
app.use("/api/v1/", router_1.default);
// Pastikan path ke `uploads/` selalu mengarah ke src/uploads, baik saat development maupun production
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "src/uploads")));
db_config_1.default.then(() => {
    app.listen(PORT, () => {
        console.log(`Server is listening on ${PORT}`);
    });
});
// List all active endpoints
const endpoints = (0, express_list_endpoints_1.default)(app);
// Safely log endpoints using console.table
console.log("Active endpoints:");
console.table(endpoints.map((endpoint) => ({
    path: endpoint.path,
    methods: endpoint.methods.join(", "),
})));
