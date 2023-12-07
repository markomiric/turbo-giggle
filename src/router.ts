import express, { Request, Response } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    verifyUserEmail,
    sendVerificationToken,
} from "./handlers/auth";
import {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
} from "./handlers/user";
import protect from "./middleware/authMiddleware";
import { loginRequestLimiter } from "./middleware/requestLimitMiddleware";
import {
    indexPage,
    loginPage,
    registerPage,
    sendVerificationTokenPage,
} from "./handlers/pages";

const router = express.Router();

router.route("/healthz").get(async (req: Request, res: Response) => {
    res.send("Ok!");
});

router.route("/register").get(registerPage);
router.route("/verification/send").get(sendVerificationTokenPage);
router.route("/login").get(loginPage);
router.route("/").get(protect, indexPage);

router.route("/api/v1/auth/register").post(registerUser);
router.route("/api/v1/auth/verify/:userId/:token").get(verifyUserEmail);
router.route("/api/v1/auth/verify").post(sendVerificationToken);
router.route("/api/v1/auth/login").post(loginRequestLimiter, loginUser);
router.route("/api/v1/auth/logout").get(logoutUser);

router.route("/api/v1/users").get(protect, getUsers).post(protect, createUser);
router
    .route("/api/v1/users/:id")
    .get(protect, getUser)
    .put(protect, updateUser)
    .delete(protect, deleteUser);

export default router;
