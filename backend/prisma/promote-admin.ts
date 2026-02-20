import { PrismaClient } from '@prisma/client';

async function promoteToAdmin(email: string) {
    const prisma = new PrismaClient();
    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });
        console.log(`Successfully promoted ${email} to ADMIN.`);
        console.log(`User details:`, user);
    } catch (error) {
        console.error(`Failed to promote ${email} to ADMIN:`, error.message);
        console.log('Ensure you have logged in at least once so your user record exists in the database.');
    } finally {
        await prisma.$disconnect();
    }
}

const email = process.argv[2];
if (!email) {
    console.error('Usage: npx ts-node prisma/promote-admin.ts <email>');
    process.exit(1);
}

promoteToAdmin(email);
