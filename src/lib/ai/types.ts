import type { LogicAnswer, Problem, SubSkillKey } from "../logic";

// The 8 required feedback elements (spec §4). AI must fill all of them.
export type Feedback = {
  good: string; // 1. 良かった点
  improve: string; // 2. 改善点
  logicalLeap: string; // 3. 論理的な飛躍
  weakEvidence: string; // 4. 根拠不足
  counterArgument: string; // 5. 反対意見
  blindSpot: string; // 6. 見落としている視点
  nextQuestion: string; // 7. 次に考えるべき問い
  action: string; // 8. 具体的な改善アクション
};

export type Evaluation = {
  subScores: Record<SubSkillKey, number>; // 0-100 each
  totalScore: number; // 0-100
  feedback: Feedback;
  summary: string; // one-line honest summary
  provider: string;
};

export interface Evaluator {
  readonly name: string;
  evaluate(problem: Problem, answer: LogicAnswer): Promise<Evaluation>;
}
