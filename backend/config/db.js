import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        console.log("Attempting to connect to:", process.env.MONGODB_URI ? "URI is set" : "URI is MISSING");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB Connected");
    } catch (error) {
        console.log("DB Connection Error:", error);
    }
}