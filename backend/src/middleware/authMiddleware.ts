import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

interface AuthRequest extends Request {
    user?: {id: string}
}

// Middleware to verify JWT token
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.split(" ")[1] 

    if (!token) {
        res.status(401).json({error: "No token, authorization denied"})
        return
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {id: string}
        req.user = decoded
        next()
    } catch (error) {
        res.status(401).json({error: "Invalid token"})
    }
}