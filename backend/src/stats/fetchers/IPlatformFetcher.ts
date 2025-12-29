export interface PlatformStats {
    rating: number;
    solved: number;
}

export interface IPlatformFetcher {
    fetchStats(username: string): Promise<PlatformStats | null>;
}
