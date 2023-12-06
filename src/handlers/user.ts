import { Request, Response } from "express";
import { assert } from "superstruct";

import prisma from "../db";
import { generateHash } from "../utils/auth";
import { UserCreateSchema, UserUpdateSchema } from "../schemas/user";

/**
 * Creates a new user in a database and sends the user ID as a JSON response.
 * @param req The request object from the Express framework.
 * @param res The response object from the Express framework.
 */
export const createUser = async (req: Request, res: Response) => {
    assert(req.body, UserCreateSchema);
    const user = await prisma.user.create({
        data: {
            email: req.body.email as string,
            password: await generateHash(req.body.password),
        },
    });

    res.status(201).json({ id: user.id });
};

/**
 * Retrieves a list of users from a database and sends the list as a JSON response.
 * @param req The request object from the Express framework.
 * @param res The response object from the Express framework.
 */
export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                active: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve users" });
    }
};

/**
 * Retrieves a single user from a database and sends the user as a JSON response.
 * @param req The request object from the Express framework.
 * @param res The response object from the Express framework.
 */
export const getUser = async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        select: {
            id: true,
            email: true,
            active: true,
            createdAt: true,
            updatedAt: true,
        },
        where: {
            id: req.params.id,
        },
    });

    res.json(user);
};

/**
 * Updates a single user in a database and sends the user as a JSON response.
 * @param req The request object from the Express framework.
 * @param res The response object from the Express framework.
 */
export const updateUser = async (req: Request, res: Response) => {
    assert(req.body, UserUpdateSchema);
    const user = await prisma.user.update({
        select: {
            id: true,
            email: true,
            active: true,
            createdAt: true,
            updatedAt: true,
        },
        where: {
            id: req.params.id,
        },
        data: {
            email: req.body.email as string,
            password: req.body.password,
        },
    });

    res.json(user);
};

/**
 * Deletes a single user from a database and sends the user ID as a JSON response.
 * @param req The request object from the Express framework.
 * @param res The response object from the Express framework.
 */
export const deleteUser = async (req: Request, res: Response) => {
    await prisma.user.delete({
        where: {
            id: req.params.id,
        },
    });
    res.json({ id: req.params.id });
};
