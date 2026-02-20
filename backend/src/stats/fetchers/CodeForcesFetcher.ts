import { Logger } from '@nestjs/common';
import { IPlatformFetcher, PlatformStats } from './IPlatformFetcher';
import axios from 'axios';

export class CodeForcesFetcher implements IPlatformFetcher {
    private readonly logger = new Logger(CodeForcesFetcher.name);

    async fetchStats(username: string): Promise<PlatformStats | null> {
        try {
            this.logger.log(`Fetching CodeForces stats for: ${username}`);

            // 1. Get rating from user.info
            const infoRes = await axios.get(`https://codeforces.com/api/user.info?handles=${username}`);
            if (infoRes.data.status !== 'OK') return null;
            const rating = infoRes.data.result[0].rating || 0;

            // 2. Get unique solved count from user.status
            const statusRes = await axios.get(`https://codeforces.com/api/user.status?handle=${username}`);
            if (statusRes.data.status !== 'OK') return { solved: 0, rating };

            const submissions = statusRes.data.result;
            const solvedProblems = new Set<string>();

            submissions.forEach((sub: any) => {
                if (sub.verdict === 'OK') {
                    const problemId = `${sub.problem.contestId}${sub.problem.index}`;
                    solvedProblems.add(problemId);
                }
            });

            const solved = solvedProblems.size;
            this.logger.log(`CodeForces for ${username}: Solved ${solved}, Rating ${rating}`);

            return { solved, rating };
        } catch (error) {
            this.logger.error(`Error fetching CodeForces stats for ${username}:`, error.message);
            return null;
        }
    }

    async fetchSolvedProblems(username: string): Promise<Set<string> | null> {
        try {
            const statusRes = await axios.get(`https://codeforces.com/api/user.status?handle=${username}`);
            if (statusRes.data.status !== 'OK') return null;

            const solvedProblems = new Set<string>();
            statusRes.data.result.forEach((sub: any) => {
                if (sub.verdict === 'OK') {
                    // Create ID as ContestId + Index (e.g., 4A, 123C)
                    const problemId = `${sub.problem.contestId}${sub.problem.index}`;
                    solvedProblems.add(problemId);
                }
            });
            return solvedProblems;
        } catch (error) {
            this.logger.error(`Error fetching CodeForces solved problems for ${username}:`, error.message);
            return null;
        }
    }
}
