export default {
    env: "testing",
    port: process.env.PORT || 5000,
    secrets: {
        jwt: "secret",
        mailgunApiKey: "mailgunApiKey",
        mailgunDomain: "mailgunDomain",
    },
    email: "test@email.com",
};
