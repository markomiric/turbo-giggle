import fs from "fs";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import nodemailerTransport from "../helpers/email.js";
import { logger } from "./logger.js";
import config from "../config";

/**
 * Sends an email using the Nodemailer library.
 * @param email - The recipient's email address.
 * @param subject - The subject of the email.
 * @param payload - The data to be passed to the email template.
 * @param template - The path to the email template file.
 */
const sendEmail = async (
    email: string,
    subject: string,
    payload: object,
    template: string
): Promise<void> => {
    try {
        // @ts-ignore
        const __filename = fileURLToPath(new URL(import.meta.url));
        const __dirname = path.dirname(__filename);
        const sourceDirectory = fs.readFileSync(
            path.join(__dirname, template),
            "utf8"
        );

        const compiledTemplate = ejs.compile(sourceDirectory);

        const emailOptions = {
            from: config.email,
            to: email,
            subject: subject,
            html: compiledTemplate(payload),
        };

        await nodemailerTransport.sendMail(emailOptions);
    } catch (error) {
        logger.error(`email not sent: ${error}`);
    }
};

export default sendEmail;
