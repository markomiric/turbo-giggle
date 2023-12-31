import { Request, Response } from "express";
import prisma from "../db";

export const registerPage = async (req: Request, res: Response) => {
    res.render(__dirname + "/../views/register.ejs");
};

export const sendVerificationTokenPage = async (
    req: Request,
    res: Response
) => {
    res.render(__dirname + "/../views/sendVerificationToken.ejs");
};

export const sendPasswordResetLinkPage = async (
    req: Request,
    res: Response
) => {
    res.render(__dirname + "/../views/sendPasswordResetLink.ejs");
};

export const resetPasswordPage = async (req: Request, res: Response) => {
    res.render(__dirname + "/../views/passwordReset.ejs");
};

export const loginPage = async (req: Request, res: Response) => {
    res.render(__dirname + "/../views/login.ejs");
};

export const indexPage = async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            active: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    res.render(__dirname + "/../views/index.ejs", {
        users,
        user: req.context.user,
    });
};
