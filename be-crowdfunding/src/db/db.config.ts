import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const connection = `${process.env.DATABASE_URL}/${process.env.DATABASE_NAME}`;

const options = {
  autoIndex: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMs: 5000,
  socketTimeoutMS: 45000,
  family: 4,
};

const db = mongoose
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

export default db;
