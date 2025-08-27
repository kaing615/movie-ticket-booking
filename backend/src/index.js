import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpecs from "./swagger.js";
import cookieParser from "cookie-parser";
import http from "http";
import routes from "./routes/index.js";

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("❌ Missing JWT_SECRET (check backend/.env or dotenv path)");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", routes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.get("/", (req, res) => {
  res.send("Welcome to the Movie-Ticket-Booking-App backend!");
});

const server = http.createServer(app);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(PORT, () => {
      console.log(`MONGO URL : ${process.env.MONGO_URL}`);
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error: ", err);
    process.exit(1);
  });
