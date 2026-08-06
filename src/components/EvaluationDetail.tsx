// Pure, server-renderable component that shows a saved LOGIC evaluation:
// 7 sub-skill scores + the 8-element AI feedback. Reused by the training
// result screen and the history detail page.
import { SUB_SKILLS } from "@/lib/logic";
import type { Feedback } from "@/lib/ai";

const FB_ITEMS: { key: keyof Feedback; label: string; cls: string }[] = [
  { key: "good", label: "① 良かった点", cls: "good" },
  { key: "improve", label: "② 改善点", cls: "warn" },
  { key: "logicalLeap", label: "③ 論理的な飛躍", cls: "bad" },
  { key: "weakEvidence", label: "④ 根拠不足", cls: "bad" },
  { key: "counterArgument", label: "⑤ 反対意見", cls: "info" },
  { key: "blindSpot", label: "⑥ 見落としている視点", cls: "info" },
  { key: "nextQuestion", label: "⑦ 次に考えるべき問い", cls: "info" },
  { key: "action", label: "⑧ 具体的な改善アクション", cls: "good" },
];

export default function EvaluationDetail({
  subScores,
  feedback,
}: {
  subScores: Record<string, number>;
  feedback: Partial<Feedback>;
}) {
  return (
    <>
      <div className="panel">
        <h3>7つのサブスキル</h3>
        {SUB_SKILLS.map((s) => (
          <div className="score-row" key={s.key}>
            <div className="label">{s.label}</div>
            <div className="bar">
              <i style={{ width: `${subScores[s.key] ?? 0}%`, background: "var(--logic)" }} />
            </div>
            <div className="val">{subScores[s.key] ?? 0}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <h3>AIコーチからのフィードバック</h3>
        {FB_ITEMS.map((f) => (
          <div className={`fb ${f.cls}`} key={f.key}>
            <div className="h">{f.label}</div>
            <div className="small">{feedback[f.key] || "—"}</div>
          </div>
        ))}
      </div>
    </>
  );
}
