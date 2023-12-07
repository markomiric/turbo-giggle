import crypto from "crypto";
import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import config from "../config";

/**
 * Generates a hash for a given password using the bcrypt library.
 * @param password - The password to generate a hash for.
 * @returns A promise that resolves to the generated hash.
 */
export const generateHash = async (password: string): Promise<string> => {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
};

/**
 * Compares a given password to a given hash using the bcrypt library.
 * @param password - The password to compare.
 * @param hash - The hash to compare.
 * @returns A promise that resolves to a boolean indicating whether the password and hash match.
 */
export const compareHash = async (
    password: string,
    hash: string
): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};

/**
 * Generates a JSON Web Token (JWT) for the given user ID.
 * @param userId The user ID to generate the token for.
 * @returns The generated JWT.
 */
export const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, config.secrets.jwt, {
        expiresIn: "30d",
    });
};

/**
 * Creates a SHA-256 hash for a given token.
 * @param token The token to hash.
 * @returns The generated hash.
 */
export const createSha256Hash = (token: string): string => {
    const hash = crypto.createHash("sha256");
    hash.update(token);
    return hash.digest("hex");
};
