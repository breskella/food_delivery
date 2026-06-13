import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import 'dotenv/config'
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import os from 'os'
import path from 'path'

// app config
const app = express()

// middleware
app.use(express.json())
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

// initialize DB connection at module import time so serverless functions can reuse
// an existing connection across warm invocations when possible
connectDB();

// determine images directory (use UPLOAD_DIR or temp dir on serverless)
const imagesDir = process.env.UPLOAD_DIR || (process.env.VERCEL ? os.tmpdir() : 'uploads')

// Serve static images from configured directory (if it exists)
app.use('/images', express.static(path.resolve(imagesDir)))

//api endpoints
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// API endpoints
app.get("/", (req, res) => {
    res.send("API Working")
})

// Export the Express app instead of listening directly. Serverless platforms
// (like Vercel) will import this module and invoke the app via their handler.
export default app