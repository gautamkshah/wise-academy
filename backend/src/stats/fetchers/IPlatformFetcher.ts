export interface PlatformStats {
    rating: number | null;
    solved: number;
}

export interface IPlatformFetcher {
    fetchStats(username: string): Promise<PlatformStats | null>;
}
