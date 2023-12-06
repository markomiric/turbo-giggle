import morgan from "morgan";
import { Request, Response } from "express";
import { logger } from "../utils/logger";

const requestLoggerMiddleware = morgan(
    (payload, req: Request, res: Response) => {
        return JSON.stringify({
            method: payload.method(req, res),
            url: payload.url(req, res),
            status: Number.parseFloat(payload.status(req, res) || "0") || 0,
            content_length: payload.res(req, res, "content-length"),
            response_time:
                Number.parseFloat(payload["response-time"](req, res) || "0") ||
                0,
        });
    },
    {
        stream: {
            write: (message) => {
                const data = JSON.parse(message);
                logger.http(`incoming-request`, data);
            },
        },
    }
);

export default requestLoggerMiddleware;
