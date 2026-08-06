import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import EvaluationDetail from "@/components/EvaluationDetail";
import { ANSWER_FIELDS, type LogicAnswer } from "@/lib/logic";
import type { Feedback } from "@/lib/ai";

export const dynamic = "force-dynamic";

function safeParse<T>(s: string, fallback: T): T {
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

export default async function HistoryDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  // Authorization: only load an attempt owned by this user.
  const attempt = await prisma.logicAttempt.findFirst({
    where: { id, userId: user.id },
  });
  if (!attempt) notFound();

  const answer = safeParse<Partial<LogicAnswer>>(attempt.answerJson, {});
  const subScores = safeParse<Record<string, number>>(attempt.subScores, {});
  const feedback = safeParse<Partial<Feedback>>(attempt.feedback, {});

  return (
    <>
      <NavBar active="/history" name={user.name} />
      <main className="container" style={{ padding: "24px 20px 60px", maxWidth: 760 }}>
        <Link href="/history" className="btn btn-ghost small" style={{ padding: "6px 12px", marginBottom: 12, display: "inline-block" }}>
          ← 履歴に戻る
        </Link>

        <div className="stack">
          <div className="panel">
            <div className="row spread">
              <div>
                <span className="tag">{attempt.category}</span>
                <h2 style={{ marginTop: 8, marginBottom: 4 }}>評価結果</h2>
                <p className="small muted" style={{ margin: 0 }}>
                  {attempt.problemText}
                </p>
                <p className="small muted" style={{ marginTop: 6 }}>
                  {attempt.createdAt.toLocaleString("ja-JP")} ・ 評価エンジン: {attempt.aiProvider}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="score-big" style={{ color: "var(--logic)" }}>
                  {attempt.totalScore}
                </div>
                <div className="small muted">/ 100</div>
              </div>
            </div>
          </div>

          <EvaluationDetail subScores={subScores} feedback={feedback} />

          <div className="panel">
            <h3>そのときの自分の回答</h3>
            {ANSWER_FIELDS.map((f) => (
              <div className="field" key={f.key} style={{ marginBottom: 12 }}>
                <label>{f.label}</label>
                <div className="small" style={{ whiteSpace: "pre-wrap", color: "var(--text)" }}>
                  {answer[f.key]?.trim() ? answer[f.key] : <span className="muted">（未記入）</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="row">
            <Link href="/history" className="btn">
              履歴に戻る
            </Link>
            <Link href="/logic" className="btn btn-primary">
              もう1問解く
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
