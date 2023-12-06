import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
    {
        email: "john.doe@email.com",
        password:
            "$2b$10$qD8hvgKxeNpFbvw7gwnDSeQxr40JSzEHzQE6yOOFHjNjiCFSntnlW",
    },
    {
        email: "jane.doe@email.com",
        password:
            "$2b$10$qD8hvgKxeNpFbvw7gwnDSeQxr40JSzEHzQE6yOOFHjNjiCFSntnlW",
    },
];

async function main() {
    console.log(`Start seeding ...`);
    for (const u of userData) {
        const user = await prisma.user.create({
            data: u,
        });
        console.log(`Created user with id: ${user.id}`);
    }
    console.log(`Seeding finished.`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
