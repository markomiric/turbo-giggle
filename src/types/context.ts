import { Server } from "socket.io";
import { User } from "../schemas/user";

export class Context {
    public io: Server;
    public user?: User;

    constructor(io: Server, user?: User) {
        this.io = io;
        this.user = user;
    }
}
