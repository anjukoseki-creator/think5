import { prisma } from "./db";
import { SUB_SKILLS, type SubSkillKey } from "./logic";

export type Attempt = {
  id: string;
  problemText: string;
  totalScore: number;
  subScores: Record<string, number>;
  createdAt: Date;
};

export async function getLogicAttempts(userId: string): Promise<Attempt[]> {
  const rows = await prisma.logicAttempt.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    problemText: r.problemText,
    totalScore: r.totalScore,
    subScores: safeParse(r.subScores),
    createdAt: r.createdAt,
  }));
}

// Current LOGIC ability = average of the last up-to-3 attempts (stability-weighted,
// per spec §22: "安定して再現できる状態"). Latest attempt weighted a bit more.
export function currentLogic(attempts: Attempt[]): number {
  if (attempts.length === 0) return 0;
  const last = attempts.slice(-3);
  const weights = last.map((_, i) => i + 1); // older→newer increasing
  const wsum = weights.reduce((a, b) => a + b, 0);
  const v = last.reduce((s, a, i) => s + a.totalScore * weights[i], 0) / wsum;
  return Math.round(v);
}

// Aggregate current sub-skill scores across the last up-to-3 attempts.
export function currentSubSkills(attempts: Attempt[]): Record<SubSkillKey, number> {
  const out = {} as Record<SubSkillKey, number>;
  const last = attempts.slice(-3);
  for (const s of SUB_SKILLS) {
    if (last.length === 0) {
      out[s.key] = 0;
      continue;
    }
    out[s.key] = Math.round(
      last.reduce((sum, a) => sum + (a.subScores[s.key] ?? 0), 0) / last.length
    );
  }
  return out;
}

export function weakestSubSkill(sub: Record<SubSkillKey, number>) {
  const sorted = SUB_SKILLS.map((s) => ({ ...s, v: sub[s.key] })).sort((a, b) => a.v - b.v);
  return sorted[0];
}
export function strongestSubSkill(sub: Record<SubSkillKey, number>) {
  const sorted = SUB_SKILLS.map((s) => ({ ...s, v: sub[s.key] })).sort((a, b) => b.v - a.v);
  return sorted[0];
}

// Compare current LOGIC to the average of the first up-to-3 attempts.
export function progressDelta(attempts: Attempt[]): number | null {
  if (attempts.length < 2) return null;
  const first = attempts.slice(0, 3);
  const base = Math.round(first.reduce((s, a) => s + a.totalScore, 0) / first.length);
  return currentLogic(attempts) - base;
}

function safeParse(s: string): Record<string, number> {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
