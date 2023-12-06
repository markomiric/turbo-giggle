import merge from "lodash.merge";

process.env.NODE_ENV = process.env.NODE_ENV || "development";
const environment = process.env.NODE_ENV;

let envConfig;

if (environment == "production") {
    envConfig = require("./production").default;
} else if (environment == "testing") {
    envConfig = require("./testing").default;
} else {
    envConfig = require("./development").default;
}

export default merge(
    {
        environment,
        env: process.env.NODE_ENV,
        port: process.env.PORT || 5000,
        secrets: {
            jwt: process.env.JWT_SECRET || "secret",
            mailgunApiKey: process.env.MAILGUN_API_KEY,
            mailgunDomain: process.env.MAILGUN_DOMAIN,
        },
        email: process.env.EMAIL || "app@email.com",
    },
    envConfig
);
