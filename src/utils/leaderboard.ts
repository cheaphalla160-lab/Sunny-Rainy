export type RoundMode = '60s' | '90s' | 'free';

export interface LeaderboardEntry {
  id: string;
  studentName: string;
  score: number;
  wordsCaught: number;
  readAloudCount: number;
  sunnyCount: number;
  rainyCount: number;
  mode: RoundMode;
  createdAt: string;
}

const STORAGE_KEY = 'sunny_rainy_zoo_leaderboard_v1';

const SEED_ENTRIES: LeaderboardEntry[] = [
  {
    id: 'seed-1',
    studentName: 'Mia · 三(1)班',
    score: 265,
    wordsCaught: 21,
    readAloudCount: 11,
    sunnyCount: 11,
    rainyCount: 10,
    mode: '60s',
    createdAt: '2026-11-22T09:15:00.000Z',
  },
  {
    id: 'seed-2',
    studentName: 'Leo · 三(2)班',
    score: 240,
    wordsCaught: 19,
    readAloudCount: 10,
    sunnyCount: 10,
    rainyCount: 9,
    mode: '60s',
    createdAt: '2026-11-22T09:20:00.000Z',
  },
  {
    id: 'seed-3',
    studentName: 'Chloe · 三(1)班',
    score: 215,
    wordsCaught: 18,
    readAloudCount: 7,
    sunnyCount: 9,
    rainyCount: 9,
    mode: '60s',
    createdAt: '2026-11-22T10:05:00.000Z',
  },
  {
    id: 'seed-4',
    studentName: 'Lucas · 三(3)班',
    score: 190,
    wordsCaught: 16,
    readAloudCount: 6,
    sunnyCount: 7,
    rainyCount: 9,
    mode: '90s',
    createdAt: '2026-11-22T10:30:00.000Z',
  },
  {
    id: 'seed-5',
    studentName: 'Emma · 三(2)班',
    score: 165,
    wordsCaught: 14,
    readAloudCount: 5,
    sunnyCount: 8,
    rainyCount: 6,
    mode: '60s',
    createdAt: '2026-11-22T11:10:00.000Z',
  },
];

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ENTRIES));
      return [...SEED_ENTRIES];
    }
    const parsed = JSON.parse(raw) as LeaderboardEntry[];
    if (!Array.isArray(parsed)) {
      return [...SEED_ENTRIES];
    }
    return [...parsed].sort((a, b) => b.score - a.score || b.wordsCaught - a.wordsCaught);
  } catch {
    return [...SEED_ENTRIES];
  }
}

export function addLeaderboardEntry(
  entry: Omit<LeaderboardEntry, 'id' | 'createdAt'>
): { entries: LeaderboardEntry[]; newEntry: LeaderboardEntry; rank: number } {
  const current = getLeaderboard();
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  const updated = [...current, newEntry]
    .sort((a, b) => b.score - a.score || b.wordsCaught - a.wordsCaught)
    .slice(0, 30);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors in restricted sandboxes
  }

  const rank = updated.findIndex((item) => item.id === newEntry.id) + 1;
  return { entries: updated, newEntry, rank: rank > 0 ? rank : updated.length };
}

export function clearLeaderboard(): LeaderboardEntry[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch {
    // Ignore storage quota errors
  }
  return [];
}

export function restoreSampleLeaderboard(): LeaderboardEntry[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ENTRIES));
  } catch {
    // Ignore storage quota errors
  }
  return [...SEED_ENTRIES];
}
