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
const port = process.env.PORT || 4000

// middleware
app.use(express.json())
app.use(cors())

//db connection
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

app.listen(port, () => {
    console.log(`Server Started on port ${port}`)
})