import {
    define,
    Infer,
    object,
    string,
    date,
    nullable,
    intersection,
    refine,
} from "superstruct";
import isEmail from "is-email";
import isUuid from "is-uuid";

// @ts-ignore
export const Email = define("Email", isEmail);
// @ts-ignore
export const Uuid = define("Uuid", (value) => isUuid.v4(value));

export const UserSchema = object({
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

export const EmailSchema = object({
    email: Email,
});

export const BasePasswordConfirmationSchema = object({
    password: string(),
    repeatPassword: string(),
});

export const PasswordConfirmationSchema = intersection([
    refine(
        BasePasswordConfirmationSchema,
        "PasswordMatch",
        (schema: { password: string; repeatPassword: string }) =>
            schema.password === schema.repeatPassword
    ),
]);

export type User = Infer<typeof UserGetSchema>;
