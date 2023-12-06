import rateLimit from "express-rate-limit";
import { logger } from "../utils/logger";

export const apiRequestLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: {
        message:
            "Too many requests from this IP address, please try again after 15 minmutes",
    },
    handler: (req, res, next, options) => {
        logger.error(
            `Too many requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`
        );
        res.status(options.statusCode).send(options.message);
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const loginRequestLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 500,
    message: {
        message:
            "Too many login attempts from this IP address, please try again after 30 minutes",
    },
    handler: (req, res, next, options) => {
        logger.error(
            `Too many requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`
        );
        res.status(options.statusCode).send(options.message);
    },
    standardHeaders: true,
    legacyHeaders: false,
});
