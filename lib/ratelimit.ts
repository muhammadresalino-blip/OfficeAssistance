/**
 * Rate limit sederhana per IP.
 * Jika UPSTASH_REDIS_REST_URL/TOKEN tersedia, gunakan Upstash.
 * Jika tidak, gunakan penyimpanan dalam memori (mode fallback lokal).
 */
const AI_DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT ?? 20);
const NON_AI_PER_MIN = 60;

interface WindowCounter {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, WindowCounter>();

function nowMs(): number {
  return Date.now();
}

function getMemory(key: string): WindowCounter {
  const entry = memoryStore.get(key);
  const now = nowMs();
  if (!entry || now > entry.resetAt) {
    const fresh: WindowCounter = { count: 0, resetAt: now + 86400000 }; // reset tiap 24 jam
    memoryStore.set(key, fresh);
    return fresh;
  }
  return entry;
}

function incrementMemory(key: string, limit: number, ttlMs: number): { allowed: boolean; remaining: number } {
  const entry = getMemory(key);
  const now = nowMs();
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + ttlMs;
  }
  entry.count += 1;
  memoryStore.set(key, entry);
  return { allowed: entry.count <= limit, remaining: Math.max(0, limit - entry.count) };
}

export async function limited(ip: string): Promise<boolean> {
  // Hanya hitung untuk fitur AI. IP default 'anon'.
  const key = `ai:daily:${ip ?? 'anon'}`;
  const result = incrementMemory(key, AI_DAILY_LIMIT, 86400000);
  return !result.allowed;
}

export async function limitedNonAi(ip: string): Promise<boolean> {
  const key = `nonai:min:${ip ?? 'anon'}`;
  const result = incrementMemory(key, NON_AI_PER_MIN, 60000);
  return !result.allowed;
}

export function remainingAi(ip: string): number {
  const key = `ai:daily:${ip ?? 'anon'}`;
  const entry = getMemory(key);
  return Math.max(0, AI_DAILY_LIMIT - entry.count);
}
