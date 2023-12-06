export default {
    env: "production",
    port: process.env.PORT,
    secrets: {
        jwt: process.env.JWT_SECRET,
        mailgunApiKey: process.env.MAILGUN_API_KEY,
        mailgunDomain: process.env.MAILGUN_DOMAIN,
    },
    email: process.env.EMAIL,
};
