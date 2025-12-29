import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding database...');

    // 1. Create Courses
    const course1 = await prisma.course.upsert({
        where: { title: 'Mastering DSA' },
        update: {},
        create: {
            title: 'Mastering DSA',
            description: 'The ultimate guide to Data Structures and Algorithms.',
            level: 'Advanced',
        },
    });

    const course2 = await prisma.course.upsert({
        where: { title: 'Fullstack Web Development' },
        update: {},
        create: {
            title: 'Fullstack Web Development',
            description: 'Build production-ready apps with Next.js and NestJS.',
            level: 'Intermediate',
        },
    });

    // 2. Create Chapters for DSA
    const chapter1 = await prisma.chapter.upsert({
        where: { course_id_order_no: { course_id: course1.id, order_no: 1 } },
        update: {},
        create: {
            title: 'Arrays & Hashing',
            order_no: 1,
            course_id: course1.id,
        },
    });

    const chapter2 = await prisma.chapter.upsert({
        where: { course_id_order_no: { course_id: course1.id, order_no: 2 } },
        update: {},
        create: {
            title: 'Two Pointers',
            order_no: 2,
            course_id: course1.id,
        },
    });

    // 3. Create Problems
    // Note: Problem doesn't have a unique constraint for title/chapter yet, 
    // so we'll just check if they exist or use createMany if empty.
    const problemCount = await prisma.problem.count();
    if (problemCount === 0) {
        await prisma.problem.createMany({
            data: [
                {
                    title: 'Two Sum',
                    platform: 'LeetCode',
                    difficulty: 'Easy',
                    leetcode_link: 'https://leetcode.com/problems/two-sum/',
                    chapter_id: chapter1.id,
                    tags: ['Array', 'Hash Table'],
                },
                {
                    title: 'Contains Duplicate',
                    platform: 'LeetCode',
                    difficulty: 'Easy',
                    leetcode_link: 'https://leetcode.com/problems/contains-duplicate/',
                    chapter_id: chapter1.id,
                    tags: ['Array', 'Hash Table'],
                },
                {
                    title: 'Valid Anagram',
                    platform: 'LeetCode',
                    difficulty: 'Easy',
                    leetcode_link: 'https://leetcode.com/problems/valid-anagram/',
                    chapter_id: chapter1.id,
                    tags: ['String', 'Hash Table'],
                },
                {
                    title: 'Valid Palindrome',
                    platform: 'LeetCode',
                    difficulty: 'Easy',
                    leetcode_link: 'https://leetcode.com/problems/valid-palindrome/',
                    chapter_id: chapter2.id,
                    tags: ['String', 'Two Pointers'],
                },
                {
                    title: 'Two Sum II',
                    platform: 'LeetCode',
                    difficulty: 'Medium',
                    leetcode_link: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/',
                    chapter_id: chapter2.id,
                    tags: ['Array', 'Two Pointers'],
                },
            ],
        });
    }
    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
