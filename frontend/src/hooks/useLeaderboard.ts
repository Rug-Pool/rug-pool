export interface LeaderboardEntry {
  rank: number;
  address: string;
  lossAmount: number;
  roundsSurvived: number;
}

export function useLeaderboard() {
  async function getLeaderboard(): Promise<LeaderboardEntry[]> {
    return [];
  }

  return { getLeaderboard };
}
