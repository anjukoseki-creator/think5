"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ANSWER_FIELDS, SUB_SKILLS, type Problem } from "@/lib/logic";
import { submitLogic, type SubmitState } from "./actions";

export default function LogicTrainer({ problem }: { problem: Problem }) {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitLogic, {});
  const ev = state.evaluation;
  const evaluated = state.evaluated;

  if (ev && evaluated) {
    return (
      <div className="stack">
        <div className="panel">
          <div className="row spread">
            <div>
              <span className="tag">{evaluated.category}</span>
              <h2 style={{ marginTop: 8 }}>評価結果</h2>
              <p className="small muted" style={{ margin: 0, maxWidth: 520 }}>
                {evaluated.title}：{evaluated.prompt}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="score-big" style={{ color: "var(--logic)" }}>
                {ev.totalScore}
              </div>
              <div className="small muted">/ 100</div>
            </div>
          </div>
          <p className="notice">{ev.summary}</p>
          <div className="pill" style={{ marginTop: 8 }}>
            評価エンジン: {ev.provider === "mock" ? "モック評価（APIキー未設定）" : ev.provider}
          </div>
        </div>

        <div className="panel">
          <h3>7つのサブスキル</h3>
          {SUB_SKILLS.map((s) => (
            <div className="score-row" key={s.key}>
              <div className="label">{s.label}</div>
              <div className="bar">
                <i style={{ width: `${ev.subScores[s.key]}%`, background: "var(--logic)" }} />
              </div>
              <div className="val">{ev.subScores[s.key]}</div>
            </div>
          ))}
        </div>

        <div className="panel">
          <h3>AIコーチからのフィードバック</h3>
          <p className="small muted">
            AIはあなたを定義しません。以下は「過去のデータから見える仮説」です。違うと思う点はプロフィールで修正できます。
          </p>
          <Fb cls="good" h="① 良かった点" body={ev.feedback.good} />
          <Fb cls="warn" h="② 改善点" body={ev.feedback.improve} />
          <Fb cls="bad" h="③ 論理的な飛躍" body={ev.feedback.logicalLeap} />
          <Fb cls="bad" h="④ 根拠不足" body={ev.feedback.weakEvidence} />
          <Fb cls="info" h="⑤ 反対意見" body={ev.feedback.counterArgument} />
          <Fb cls="info" h="⑥ 見落としている視点" body={ev.feedback.blindSpot} />
          <Fb cls="info" h="⑦ 次に考えるべき問い" body={ev.feedback.nextQuestion} />
          <Fb cls="good" h="⑧ 具体的な改善アクション" body={ev.feedback.action} />
        </div>

        <div className="row">
          <Link href="/dashboard" className="btn btn-primary">
            ダッシュボードで成長を見る
          </Link>
          <Link href="/logic" className="btn">
            もう1問解く
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="stack">
      <div className="panel">
        <span className="tag">{problem.category}</span>
        <h2 style={{ marginTop: 10, marginBottom: 6 }}>{problem.title}</h2>
        <p style={{ margin: 0 }}>{problem.prompt}</p>
        <div className="row" style={{ marginTop: 12 }}>
          <Link href="/logic?new=1" className="btn btn-ghost small" style={{ padding: "6px 12px" }}>
            別の問題にする
          </Link>
        </div>
      </div>

      {state.error && <div className="error">{state.error}</div>}

      <input type="hidden" name="problemId" value={problem.id} />

      <div className="panel">
        <h3>回答フロー（9ステップ）</h3>
        <p className="small muted">
          型に沿って考えを言語化します。全部埋めなくてもOK。まずは問い・結論・根拠から。
        </p>
        {ANSWER_FIELDS.map((f) => (
          <div className="field" key={f.key}>
            <label>{f.label}</label>
            <div className="hint">{f.hint}</div>
            <textarea name={f.key} rows={f.key === "conclusion" ? 2 : 3} />
          </div>
        ))}

        <div className="divider" />
        <div className="field">
          <label>この回答のAIアクセスレベル（プライバシー）</label>
          <div className="hint">
            この回答データをAIが今後どこまで参照してよいか。PRIVATEにするとAIに一切送信しません。
          </div>
          <select name="aiAccessLevel" defaultValue="MEMORY" style={selectStyle}>
            <option value="PRIVATE">PRIVATE（AIに送信しない）</option>
            <option value="MEMORY">MEMORY（必要に応じて参照可）</option>
            <option value="CONTEXT">CONTEXT（現在の分析で参照可）</option>
          </select>
        </div>

        <button className="btn btn-primary" disabled={pending} style={{ width: "100%" }}>
          {pending ? "AIが評価中…" : "回答してAIの評価を受ける"}
        </button>
      </div>
    </form>
  );
}

function Fb({ cls, h, body }: { cls: string; h: string; body: string }) {
  return (
    <div className={`fb ${cls}`}>
      <div className="h">{h}</div>
      <div className="small">{body}</div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  color: "var(--text)",
  padding: "11px 13px",
};
