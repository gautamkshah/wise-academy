
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const colleges = [
    "Indian Institute of Technology (IIT) Bombay",
    "Indian Institute of Technology (IIT) Delhi",
    "Indian Institute of Technology (IIT) Kanpur",
    "Indian Institute of Technology (IIT) Madras",
    "Indian Institute of Technology (IIT) Kharagpur",
    "Indian Institute of Technology (IIT) Roorkee",
    "Indian Institute of Technology (IIT) Guwahati",
    "National Institute of Technology (NIT) Trichy",
    "National Institute of Technology (NIT) Warangal",
    "National Institute of Technology (NIT) Surathkal",
    "Birla Institute of Technology and Science (BITS) Pilani",
    "Vellore Institute of Technology (VIT) Vellore",
    "Manipal Institute of Technology (MIT) Manipal",
    "SRM Institute of Science and Technology (SRMIST) Chennai",
    "Thapar Institute of Engineering and Technology Patiala",
    "Amity University Noida",
    "Lovely Professional University (LPU) Jalandhar",
    "Chandigarh University (CU) Mohali",
    "Sharda University Greater Noida",
    "Galgotias University Greater Noida",
    "Other"
];

async function main() {
    console.log('Seeding colleges...');
    for (const name of colleges) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        await prisma.college.upsert({
            where: { name },
            update: {},
            create: { name, slug }
        });
    }
    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
