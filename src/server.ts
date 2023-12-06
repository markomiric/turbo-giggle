import http from "http";
import { Server } from "socket.io";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "./swagger.json";
import requestLoggerMiddleware from "./middleware/requestLoggerMiddleware";

import config from "./config";
import router from "./router";
import { apiRequestLimiter } from "./middleware/requestLimitMiddleware";
import { Context } from "./types/context";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

if (config.env === "development") {
    app.use(morgan("dev"));
}
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req: Request, res: Response, next: NextFunction) => {
    req.context = new Context(io);
    next();
});

app.use(requestLoggerMiddleware);

app.set("view engine", "ejs");

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(apiRequestLimiter, router);

io.on("connection", (socket) => {
    console.log("socket connected : " + socket.id);
    socket.on("disconnect", () => {
        console.log("socket disconnected : " + socket.id);
    });
});

app.use((err: any, req: any, res: any, next: any) => {
    const statusCode = res.statusCode ? res.statusCode : 500;

    return res.status(statusCode).json({
        success: false,
        message: err.message,
        statusCode,
        stack: config.env === "production" ? null : err.stack,
    });
});

export default server;
