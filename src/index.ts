import "dotenv/config";
import { Socket } from "net";
import server from "./server";
import config from "./config";
import { logger } from "./utils/logger";

const port: number = parseInt(config.port) || 5000;

server.listen(port, () => {
    console.log(` Server running in ${config.env} mode on port ${port}`);
    console.log(` Swagger UI available at http://localhost:5000/swagger`);
    console.log(` App available at http://localhost:5000`);
    logger.info(` Server running in ${config.env} mode on port ${port}`);
});

// quit on ctrl-c when running docker in terminal
process.on("SIGINT", function onSigint() {
    console.info(
        "Got SIGINT (aka ctrl-c in docker). Graceful shutdown ",
        new Date().toISOString()
    );
    shutdown();
});

// quit properly on docker stop
process.on("SIGTERM", function onSigterm() {
    console.info(
        "Got SIGTERM (docker container stop). Graceful shutdown ",
        new Date().toISOString()
    );
    shutdown();
});

const sockets: { [socketId: number]: Socket } = {};
let nextSocketId: number = 0;
server.on("connection", function (socket: Socket) {
    const socketId = nextSocketId++;
    sockets[socketId] = socket;

    socket.once("close", function () {
        delete sockets[socketId];
    });
});

// shut down server
function shutdown() {
    waitForSocketsToClose(10);

    server.close(function onServerClosed(err) {
        if (err) {
            console.error(err);
            process.exitCode = 1;
        }
        process.exit();
    });
}

function waitForSocketsToClose(counter: number): any {
    if (counter > 0) {
        console.log(
            `Waiting ${counter} more ${
                counter !== 1 ? "seconds" : "second"
            } for all connections to close...`
        );
        return setTimeout(waitForSocketsToClose, 1000, counter - 1);
    }

    console.log("Forcing all connections to close now");
    for (var socketId in sockets) {
        sockets[socketId].destroy();
    }
}
