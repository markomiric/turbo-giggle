import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import prisma from "../db";
import config from "../config";

const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    // Read JWT from the 'jwt' cookie
    token = req.cookies.jwt;
    if (!token) {
        if (req.path === "/") {
            res.redirect("/login");
            return;
        }
        token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            res.status(401);
            throw new Error("Not authorized, no token");
        }
    }
    try {
        const decoded = jwt.verify(token, config.secrets.jwt) as JwtPayload;
        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId,
            },
        });
        if (!user) {
            throw new Error("User not found");
        }
        req.context.user = user;

        next();
    } catch (error) {
        console.error(error);
        res.status(401);
        throw new Error("Not authorized, token failed");
    }
};

export default protect;
