import type { LogicAnswer, Problem } from "../logic";
import { ANSWER_FIELDS, SUB_SKILLS } from "../logic";
import type { Evaluation, Evaluator } from "./types";
import { MockEvaluator } from "./mock";

// Real evaluator backed by the Anthropic Messages API. No SDK dependency:
// a single fetch keeps the install light. Falls back to the mock evaluator
// on any error so the app never hard-fails during training.
export class AnthropicEvaluator implements Evaluator {
  readonly name = "anthropic";
  private model = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";
  private key = process.env.ANTHROPIC_API_KEY || "";

  async evaluate(problem: Problem, answer: LogicAnswer): Promise<Evaluation> {
    if (!this.key) return new MockEvaluator().evaluate(problem, answer);
    try {
      const prompt = this.buildPrompt(problem, answer);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": this.key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) throw new Error(`anthropic ${res.status}`);
      const data = await res.json();
      const text: string = data?.content?.[0]?.text ?? "";
      const parsed = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
      return { ...parsed, provider: "anthropic" } as Evaluation;
    } catch (e) {
      console.error("[anthropic evaluator] falling back to mock:", e);
      return new MockEvaluator().evaluate(problem, answer);
    }
  }

  private buildPrompt(problem: Problem, answer: LogicAnswer): string {
    const subs = SUB_SKILLS.map((s) => `- ${s.key} (${s.label}): ${s.desc}`).join("\n");
    const ans = ANSWER_FIELDS.map((f) => `${f.label}: ${answer[f.key] || "(空欄)"}`).join("\n");
    return `あなたはユーザーの論理的思考を鍛えるコーチです。無条件に肯定せず、客観的かつ率直に、しかし人格否定はせず評価してください。

# 問題
${problem.prompt}

# ユーザーの回答（9ステップ）
${ans}

# 評価する7つのサブスキル（各0-100）
${subs}

以下のJSONのみを出力してください（前後に文章を付けない）:
{
  "subScores": { "issue": 0, "decomposition": 0, "structure": 0, "hypothesis": 0, "causality": 0, "evidence": 0, "critique": 0 },
  "totalScore": 0,
  "summary": "一文の率直な総評",
  "feedback": {
    "good": "良かった点",
    "improve": "改善点",
    "logicalLeap": "論理的な飛躍",
    "weakEvidence": "根拠不足",
    "counterArgument": "反対意見",
    "blindSpot": "見落としている視点",
    "nextQuestion": "次に考えるべき問い",
    "action": "具体的な改善アクション"
  }
}`;
  }
}
