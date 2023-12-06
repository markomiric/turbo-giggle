import "winston-daily-rotate-file";
import { createLogger, format, transports } from "winston";

const { combine, timestamp, prettyPrint } = format;

const fileRotateTransport = new transports.DailyRotateFile({
    filename: "logs/combined-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxFiles: "14d",
});

export const logger = createLogger({
    level: "http",
    format: combine(
        timestamp({
            format: "YYYY-MM-DD hh:mm:ss.SSS A",
        }),
        prettyPrint()
    ),
    transports: [
        fileRotateTransport,
        new transports.File({
            level: "error",
            filename: "logs/error.log",
        }),
    ],
    exceptionHandlers: [
        new transports.File({ filename: "logs/exceptions.log" }),
    ],
    rejectionHandlers: [
        new transports.File({ filename: "logs/rejections.log" }),
    ],
});
