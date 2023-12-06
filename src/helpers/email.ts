import nodemailer, { Transporter } from "nodemailer";
import mg from "nodemailer-mailgun-transport";
import config from "../config";

let nodemailerTransport: Transporter;

if (config.env === "production") {
    const auth = {
        auth: {
            api_key: config.secrets.mailgunApiKey,
            domain: config.secrets.mailgunDomain,
        },
    };
    nodemailerTransport = nodemailer.createTransport(mg(auth as mg.Options));
} else {
    nodemailerTransport = nodemailer.createTransport({
        host: "localhost",
        port: 1025,
    });
}

export default nodemailerTransport;
