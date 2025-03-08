import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth"
import protectedRoutes from "./routes/protected"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cookieParser())
app.use(cors({ credentials: true, origin: "http://localhost:5173" }))
app.use(express.json())
app.use("/api/protected", protectedRoutes)
app.use("/api/auth", authRoutes)

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB connection successful"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})