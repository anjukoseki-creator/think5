"use server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getProblem, ANSWER_FIELDS, type LogicAnswer } from "@/lib/logic";
import { getEvaluator, type Evaluation } from "@/lib/ai";
import { revalidatePath } from "next/cache";

export type SubmitState = {
  evaluation?: Evaluation;
  problemId?: string;
  // The problem that was actually evaluated (may differ from the freshly
  // re-rendered random problem shown on the training page).
  evaluated?: { title: string; category: string; prompt: string };
  error?: string;
};

export async function submitLogic(
  _prev: SubmitState,
  formData: FormData
): Promise<SubmitState> {
  const user = await requireUser();

  const problemId = String(formData.get("problemId") || "");
  const problem = getProblem(problemId);
  if (!problem) return { error: "問題が見つかりませんでした。" };

  const answer = {} as LogicAnswer;
  for (const f of ANSWER_FIELDS) {
    answer[f.key] = String(formData.get(f.key) || "").trim();
  }

  const filled = ANSWER_FIELDS.filter((f) => answer[f.key].length > 0).length;
  if (filled < 3) {
    return {
      error: "少なくとも3つ以上の項目を入力してください（特に問い・結論・根拠）。",
      problemId,
    };
  }

  const aiAccessLevel = String(formData.get("aiAccessLevel") || "MEMORY");

  // Evaluate (mock or real, per AI_PROVIDER).
  const evaluator = getEvaluator();
  const evaluation = await evaluator.evaluate(problem, answer);

  // Persist: LogicAttempt + Raw Data (answer & feedback) + SkillScore + access log.
  const attempt = await prisma.logicAttempt.create({
    data: {
      userId: user.id,
      problemId: problem.id,
      problemText: problem.prompt,
      category: problem.category,
      answerJson: JSON.stringify(answer),
      subScores: JSON.stringify(evaluation.subScores),
      totalScore: evaluation.totalScore,
      feedback: JSON.stringify(evaluation.feedback),
      aiProvider: evaluation.provider,
    },
  });

  await prisma.rawData.createMany({
    data: [
      {
        userId: user.id,
        content: JSON.stringify(answer),
        category: "LOGIC",
        aiAccessLevel,
      },
      {
        userId: user.id,
        content: JSON.stringify(evaluation.feedback),
        category: "FEEDBACK",
        aiAccessLevel: "MEMORY",
      },
    ],
  });

  await prisma.skillScore.create({
    data: {
      userId: user.id,
      ability: "LOGIC",
      score: evaluation.totalScore,
      sourceId: attempt.id,
    },
  });

  await prisma.aiAccessLog.create({
    data: {
      userId: user.id,
      requestType: "logic_evaluation",
      usedDataIds: JSON.stringify([]),
      purpose: `LOGIC問題「${problem.title}」の回答を評価`,
      provider: evaluation.provider,
    },
  });

  revalidatePath("/dashboard");
  return {
    evaluation,
    problemId,
    evaluated: { title: problem.title, category: problem.category, prompt: problem.prompt },
  };
}
