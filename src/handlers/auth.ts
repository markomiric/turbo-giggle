import { Request, Response } from "express";
import { randomBytes } from "node:crypto";
import { is } from "superstruct";

import prisma from "../db";
import {
    generateHash,
    compareHash,
    generateToken,
    createSha256Hash,
} from "../utils/auth";
import sendEmail from "../utils/email";
import config from "../config";
import {
    UserSchema,
    EmailSchema,
    PasswordConfirmationSchema,
} from "../schemas/user";

export const registerUser = async (req: Request, res: Response) => {
    if (!is(req.body, UserSchema)) {
        res.status(400).json({ message: "Invalid request body" });
        throw new Error("Invalid request body");
    }

    const userExists = await prisma.user.findUnique({
        where: {
            email: req.body.email as string,
        },
    });

    if (userExists) {
        res.status(400).json({ message: "User already exists" });
        throw new Error("User already exists");
    }

    const user = await prisma.user.create({
        data: {
            email: req.body.email as string,
            password: await generateHash(req.body.password),
        },
    });

    const verificationToken = createSha256Hash(randomBytes(16).toString("hex"));

    await prisma.verificationToken.create({
        data: {
            userId: user.id,
            token: verificationToken,
        },
    });

    const payload = {
        email: user.email,
        url: `http://localhost:5000/api/v1/auth/verify/${user.id}/${verificationToken}`,
    };

    await sendEmail(
        user.email,
        "Verify email",
        payload,
        "../templates/verifyEmail.ejs"
    );

    req.context.io.emit("register", `${user.email} registered an account`);
    res.status(201).json({
        id: user.id,
    });
};

export const verifyUserEmail = async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.params.userId,
        },
    });

    if (!user) {
        res.status(400).json({ message: "User doesn't exist" });
        throw new Error("User doesn't exist");
    }
    if (user.active) {
        res.status(400).json({
            message: "User email has already been verified",
        });
        throw new Error("User email has already been verified");
    }

    const verificationToken = await prisma.verificationToken.findUnique({
        where: {
            userId: user.id,
            token: req.params.token,
        },
    });

    if (verificationToken) {
        const date = new Date();
        const timeDifference =
            date.getTime() - verificationToken.createdAt.getTime();

        if (timeDifference > 5 * 60 * 1000) {
            res.status(400).json({
                message: "Verification token has expired",
            });
            throw new Error("Verification token has expired");
        }

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                active: true,
                updatedAt: new Date(),
            },
        });

        await prisma.verificationToken.delete({
            where: {
                token: verificationToken.token,
            },
        });

        const payload = {
            email: user.email,
            url: `http://localhost:5000/login`,
        };

        await sendEmail(
            user.email,
            "Welcome",
            payload,
            "../templates/welcome.ejs"
        );

        req.context.io.emit(
            "verify",
            `${user.email} was successfully verified and is now active`
        );
        res.redirect("/login");
    } else {
        res.status(400).json({
            message: "Invalid verification token",
        });
        throw new Error("Invalid verification token");
    }
};

export const sendVerificationToken = async (req: Request, res: Response) => {
    if (!is(req.body, EmailSchema)) {
        res.status(400).json({ message: "Invalid request body" });
        throw new Error("Invalid request body");
    }

    const user = await prisma.user.findUnique({
        where: {
            email: req.body.email as string,
        },
    });

    if (!user) {
        res.status(400).json({ message: "User doesn't exist" });
        throw new Error("User doesn't exist");
    }
    if (user.active) {
        res.status(400).json({
            message: "User email has already been verified",
        });
        throw new Error("User email has already been verified");
    }

    const verificationToken = createSha256Hash(randomBytes(16).toString("hex"));

    await prisma.verificationToken.create({
        data: {
            userId: user.id,
            token: verificationToken,
        },
    });

    const payload = {
        email: user.email,
        url: `http://localhost:5000/api/v1/auth/verify/${user.id}/${verificationToken}`,
    };

    await sendEmail(
        user.email,
        "Verify email",
        payload,
        "../templates/verifyEmail.ejs"
    );

    req.context.io.emit(
        "verify",
        `${user.email} requested a new verification email`
    );

    res.sendStatus(201);
};

export const loginUser = async (req: Request, res: Response) => {
    if (!is(req.body, UserSchema)) {
        res.status(400).json({ message: "Invalid request body" });
        throw new Error("Invalid request body");
    }

    const user = await prisma.user.findUnique({
        where: {
            email: req.body.email as string,
        },
    });
    if (!user) {
        res.status(401).json({ message: "Invalid email" });
        throw new Error("Invalid email");
    }
    if (!(await compareHash(req.body.password, user.password))) {
        res.status(401).json({ message: "Invalid password" });
        throw new Error("Invalid password");
    }
    const token = generateToken(user.id);

    // Set JWT as an HTTP-Only cookie
    res.cookie("jwt", token, {
        httpOnly: true,
        secure: config.env === "production", // Use secure cookies in production
        sameSite: "strict", // Prevent CSRF attacks
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    req.context.io.emit("login", `${user.email} logged in`);
    res.json({ accessToken: token });
};

export const logoutUser = async (req: Request, res: Response) => {
    res.clearCookie("jwt");
    req.context.io.emit("logout", `Someone logged out of the app`);
    res.status(200).redirect("/login");
};

export const sendPasswordResetLink = async (req: Request, res: Response) => {
    if (!is(req.body, EmailSchema)) {
        res.status(400).json({ message: "Invalid request body" });
        throw new Error("Invalid request body");
    }

    const user = await prisma.user.findUnique({
        where: {
            email: req.body.email as string,
        },
    });

    if (!user) {
        res.status(400).json({ message: "User doesn't exist" });
        throw new Error("User doesn't exist");
    }

    const passwordResetToken = createSha256Hash(
        randomBytes(16).toString("hex")
    );

    await prisma.verificationToken.create({
        data: {
            userId: user.id,
            token: passwordResetToken,
        },
    });

    const payload = {
        email: user.email,
        url: `http://localhost:5000/password/reset/${user.id}/${passwordResetToken}`,
    };

    await sendEmail(
        user.email,
        "Reset password",
        payload,
        "../templates/resetPassword.ejs"
    );

    res.sendStatus(201);
};

export const resetPassword = async (req: Request, res: Response) => {
    if (!is(req.body, PasswordConfirmationSchema)) {
        res.status(400).json({ message: "Invalid request body" });
        throw new Error("Invalid request body");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: req.params.userId,
        },
    });

    if (!user) {
        res.status(400).json({ message: "User doesn't exist" });
        throw new Error("User doesn't exist");
    }

    const verificationToken = await prisma.verificationToken.findUnique({
        where: {
            userId: user.id,
            token: req.params.token,
        },
    });

    if (verificationToken) {
        const date = new Date();
        const timeDifference =
            date.getTime() - verificationToken.createdAt.getTime();

        if (timeDifference > 5 * 60 * 1000) {
            res.status(400).json({
                message: "Password reset token has expired",
            });
            throw new Error("Password reset token has expired");
        }

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                password: await generateHash(req.body.password),
                updatedAt: new Date(),
            },
        });

        await prisma.verificationToken.delete({
            where: {
                token: verificationToken.token,
            },
        });

        const payload = {};

        await sendEmail(
            user.email,
            "Password reset success",
            payload,
            "../templates/resetPasswordSuccess.ejs"
        );

        req.context.io.emit(
            "reset",
            `${user.email} successfully reset their password`
        );
        res.sendStatus(200);
    } else {
        res.status(400).json({
            message: "Invalid password reset token",
        });
        throw new Error("Invalid password reset token");
    }
};
