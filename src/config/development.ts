export default {
    env: "development",
    port: process.env.PORT || 5000,
    secrets: {
        jwt: "secret",
        mailgunApiKey: "mailgunApiKey",
        mailgunDomain: "mailgunDomain",
    },
    email: "dev@email.com",
};
