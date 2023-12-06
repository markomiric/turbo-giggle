import {
    define,
    Infer,
    object,
    string,
    date,
    nullable,
    optional,
} from "superstruct";
import isEmail from "is-email";
import isUuid from "is-uuid";

// @ts-ignore
export const Email = define("Email", isEmail);
// @ts-ignore
export const Uuid = define("Uuid", (value) => isUuid.v4(value));

export const UserCreateSchema = object({
    email: Email,
    password: string(),
});

export const UserGetSchema = object({
    id: Uuid,
    email: Email,
    password: string(),
    createdAt: date(),
    updatedAt: nullable(date()),
});

export const UserUpdateSchema = object({
    email: optional(Email),
    password: optional(string()),
    updatedAt: nullable(date()),
});

export type User = Infer<typeof UserGetSchema>;
