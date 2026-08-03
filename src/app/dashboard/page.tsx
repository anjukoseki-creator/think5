import Link from "next/link";
import { requireUser } from "@/lib/auth";
import NavBar from "@/components/NavBar";
import GrowthChart from "@/components/GrowthChart";
import { SUB_SKILLS } from "@/lib/logic";
import {
  getLogicAttempts,
  currentLogic,
  currentSubSkills,
  weakestSubSkill,
  strongestSubSkill,
  progressDelta,
} from "@/lib/stats";

const ABILITIES = [
  { k: "LOGIC", label: "論理的思考", color: "var(--logic)", active: true },
  { k: "EXPRESS", label: "言語化", color: "var(--express)", active: false },
  { k: "DECIDE", label: "意思決定", color: "var(--decide)", active: false },
  { k: "BUILD", label: "0→1開発", color: "var(--build)", active: false },
  { k: "WHY", label: "価値観", color: "var(--why)", active: false },
];

export default async function Dashboard() {
  const user = await requireUser();
  const attempts = await getLogicAttempts(user.id);

  const logic = currentLogic(attempts);
  const sub = currentSubSkills(attempts);
  const weakest = weakestSubSkill(sub);
  const strongest = strongestSubSkill(sub);
  const delta = progressDelta(attempts);

  const points = attempts.map((a, i) => ({
    x: i,
    label: `#${i + 1}`,
    value: a.totalScore,
  }));

  return (
    <>
      <NavBar active="/dashboard" name={user.name} />
      <main className="container" style={{ padding: "24px 20px 60px" }}>
        {/* today's mission */}
        <div className="notice row spread" style={{ marginBottom: 20 }}>
          <div>
            <strong>今日のミッション</strong>
            <div className="small muted">
              {attempts.length === 0
                ? "まずはLOGICを1問。今日はこれだけでOKです。"
                : `LOGICを1問解いて、「${weakest.label}」を意識してみましょう。今日はこれだけでOK。`}
            </div>
          </div>
          <Link href="/logic" className="btn btn-primary">
            今日のトレーニングを始める →
          </Link>
        </div>

        {/* 5 abilities */}
        <div className="abilities" style={{ marginBottom: 20 }}>
          {ABILITIES.map((a) => (
            <div
              className="ability"
              key={a.k}
              style={{ opacity: a.active ? 1 : 0.5, borderColor: a.active ? a.color : undefined }}
            >
              <div className="k" style={{ color: a.color }}>
                {a.k}
              </div>
              <div className="v">{a.active ? logic : "—"}</div>
              <div className="sub">{a.active ? a.label : `${a.label}（Phase 3+）`}</div>
            </div>
          ))}
        </div>

        <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
          {/* growth graph */}
          <div className="panel">
            <div className="row spread">
              <h3 style={{ margin: 0 }}>LOGIC 成長グラフ</h3>
              {delta !== null && (
                <span className="pill" style={{ color: delta >= 0 ? "var(--good)" : "var(--bad)" }}>
                  初回比 {delta >= 0 ? "+" : ""}
                  {delta}
                </span>
              )}
            </div>
            <div style={{ marginTop: 12 }}>
              <GrowthChart points={points} />
            </div>
            {attempts.length > 0 && (
              <p className="small muted" style={{ marginTop: 8 }}>
                現在のLOGICスコアは直近{Math.min(attempts.length, 3)}回の平均（安定性重視）で算出しています。
              </p>
            )}
          </div>

          {/* sub-skill breakdown + weak/strong */}
          <div className="panel">
            <h3>サブスキル内訳</h3>
            {attempts.length === 0 ? (
              <p className="muted small">トレーニング後に7つのサブスキルが表示されます。</p>
            ) : (
              <>
                {SUB_SKILLS.map((s) => (
                  <div className="score-row" key={s.key}>
                    <div className="label">{s.label}</div>
                    <div className="bar">
                      <i style={{ width: `${sub[s.key]}%`, background: "var(--logic)" }} />
                    </div>
                    <div className="val">{sub[s.key]}</div>
                  </div>
                ))}
                <div className="divider" />
                <div className="fb bad">
                  <div className="h">今の最大の弱点</div>
                  <div className="small">
                    「{weakest.label}」（{weakest.v}点）— {weakest.desc}
                  </div>
                </div>
                <div className="fb good">
                  <div className="h">今の強み</div>
                  <div className="small">
                    「{strongest.label}」（{strongest.v}点）
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* recent attempts */}
        {attempts.length > 0 && (
          <div className="panel" style={{ marginTop: 16 }}>
            <h3>最近のトレーニング</h3>
            {[...attempts]
              .reverse()
              .slice(0, 5)
              .map((a) => (
                <div className="row spread" key={a.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <div className="small" style={{ maxWidth: "70%" }}>
                    {a.problemText.slice(0, 60)}
                    {a.problemText.length > 60 ? "…" : ""}
                  </div>
                  <div className="row" style={{ gap: 10 }}>
                    <span className="muted small">
                      {a.createdAt.toLocaleDateString("ja-JP")}
                    </span>
                    <span className="tag">{a.totalScore}点</span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>
    </>
  );
}
