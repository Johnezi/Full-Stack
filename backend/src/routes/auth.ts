import express, { CookieOptions } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User"
import dotenv from "dotenv"
dotenv.config()

const router = express.Router()
const SECRET = process.env.JWT_SECRET as string
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string

const COOKIE_AUTH_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development",
    sameSite: "strict"
}

interface AuthRequest extends express.Request {
    user?: { id: string; role: string }
}

// Register a new user
router.post("/register", async (req: AuthRequest, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
       res.status(400).json({ ok: false, error: "Please fill in all fields!" })
       return
    }

    const existingUser = await User.findOne({ username })
    if (existingUser) {
       res.status(400).json({ ok: false, error: "Username is already taken. Please log in!" })
       return
      
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({ username, password: hashedPassword })
    await newUser.save()
    res.json({ ok: true, message: "User created!" })
  } catch (err) {
    res.status(500).json({ ok: false, error: "Error registering user" })
  }
})

// Login a user and generate access and refresh tokens
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
       res.status(400).json({ ok: false, error: "Please enter username and password!" })
       return
    }

    const user = await User.findOne({ username })
    if (!user || !(await bcrypt.compare(password, user.password))) {
       res.status(400).json({ ok: false, error: "Incorrect username or password!" })
       return
    }

    const accessToken = jwt.sign({ id: user._id }, SECRET, { expiresIn: "15m" })
    const refreshToken = jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: "24h" })

    res.cookie("refreshToken", refreshToken, COOKIE_AUTH_OPTIONS)
    res.json({ ok: true, accessToken })
  } catch (err) {
    console.error("Error logging in:", err)
    res.status(500).json({ ok: false, error: "Error logging in" })
  }
})

// Refresh the access token using the refresh token
router.post("/refresh", (req, res) => {
  const token = req.cookies.refreshToken

  if (!token) {
     res.status(403).json({ ok: false, error: "Invalid refresh token" })
     return
  }

  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as { id: string; role: string }
    const newAccessToken = jwt.sign({ id: decoded.id, role: decoded.role }, SECRET, { expiresIn: "15m" })
    res.json({ ok: true, accessToken: newAccessToken })
  } catch (error) {
    res.status(403).json({ ok: false, error: "Invalid refresh token" })
  }
})

// Logout the user and clear the refresh token cookie
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", COOKIE_AUTH_OPTIONS)
  res.json({ ok: true, message: "Logged out" })
})

export default router
