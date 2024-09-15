import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDb } from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import friendsRouter from "./routes/friends.route.js";

dotenv.config();
const app = express();
app.use(cors());
connectDb();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRouter);
app.use("/api/friends", friendsRouter);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
