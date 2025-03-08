"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express_1.default.Router();
const SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const COOKIE_AUTH_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development",
    sameSite: "strict"
};
// Register a new user
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ ok: false, error: "Please fill in all fields!" });
            return;
        }
        const existingUser = yield User_1.default.findOne({ username });
        if (existingUser) {
            res.status(400).json({ ok: false, error: "Username is already taken. Please log in!" });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newUser = new User_1.default({ username, password: hashedPassword });
        yield newUser.save();
        res.json({ ok: true, message: "User created!" });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: "Error registering user" });
    }
}));
// Login a user and generate access and refresh tokens
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ ok: false, error: "Please enter username and password!" });
            return;
        }
        const user = yield User_1.default.findOne({ username });
        if (!user || !(yield bcryptjs_1.default.compare(password, user.password))) {
            res.status(400).json({ ok: false, error: "Incorrect username or password!" });
            return;
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id }, SECRET, { expiresIn: "15m" });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: "24h" });
        res.cookie("refreshToken", refreshToken, COOKIE_AUTH_OPTIONS);
        res.json({ ok: true, accessToken });
    }
    catch (err) {
        console.error("Error logging in:", err);
        res.status(500).json({ ok: false, error: "Error logging in" });
    }
}));
// Refresh the access token using the refresh token
router.post("/refresh", (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) {
        res.status(403).json({ ok: false, error: "Invalid refresh token" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, REFRESH_SECRET);
        const newAccessToken = jsonwebtoken_1.default.sign({ id: decoded.id, role: decoded.role }, SECRET, { expiresIn: "15m" });
        res.json({ ok: true, accessToken: newAccessToken });
    }
    catch (error) {
        res.status(403).json({ ok: false, error: "Invalid refresh token" });
    }
});
// Logout the user and clear the refresh token cookie
router.post("/logout", (req, res) => {
    res.clearCookie("refreshToken", COOKIE_AUTH_OPTIONS);
    res.json({ ok: true, message: "Logged out" });
});
exports.default = router;
