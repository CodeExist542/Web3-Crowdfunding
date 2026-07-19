import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import listEndpoints from "express-list-endpoints";
import morgan from "morgan";
import db from "./db/db.config";
import router from "./routes/router";
import path from "path";
dotenv.config();

const app = express();

app.use(cors());

app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

app.use("/api/v1/", router);

// Pastikan path ke `uploads/` selalu mengarah ke src/uploads, baik saat development maupun production
app.use("/uploads", express.static(path.join(process.cwd(), "src/uploads")));

db.then(() => {
  app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
  });
});

// List all active endpoints
const endpoints = listEndpoints(app);

// Safely log endpoints using console.table
console.log("Active endpoints:");
console.table(
  endpoints.map((endpoint) => ({
    path: endpoint.path,
    methods: endpoint.methods.join(", "),
  }))
);
