"use client";

import { useActionState } from "react";
import { saveProfile, type ProfileState } from "./actions";

export type ProfileData = {
  coreValues: string;
  strengths: string;
  weaknesses: string;
  currentGoals: string;
  currentFocus: string;
  decisionPatterns: string;
  learningPatterns: string;
  behavioralTendencies: string;
};

const FIELDS: { key: keyof ProfileData; label: string; hint: string }[] = [
  { key: "coreValues", label: "Core Values（大切にしている価値観）", hint: "自分の意思で選べること、誠実さ、成長 など" },
  { key: "strengths", label: "Strengths（強み）", hint: "" },
  { key: "weaknesses", label: "Weaknesses（弱み）", hint: "" },
  { key: "currentGoals", label: "Current Goals（今の目標）", hint: "" },
  { key: "currentFocus", label: "Current Focus（今の重点）", hint: "" },
  { key: "decisionPatterns", label: "Decision Patterns（意思決定の傾向）", hint: "" },
  { key: "learningPatterns", label: "Learning Patterns（学び方の傾向）", hint: "" },
  { key: "behavioralTendencies", label: "Behavioral Tendencies（行動の傾向）", hint: "" },
];

export default function ProfileForm({ initial }: { initial: ProfileData }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(saveProfile, {});

  return (
    <form action={action} className="panel stack">
      <div>
        <h3 style={{ margin: 0 }}>User Profile（Layer 3）</h3>
        <p className="small muted" style={{ marginTop: 6 }}>
          これはAIがあなたを理解するための要約です。<strong>すべてあなたが所有・編集できます。</strong>
          将来AIが仮説を提案しますが、承認・修正・否定できるのは常にあなたです。
        </p>
      </div>
      {state.ok && <div className="notice">保存しました。AIは今後この内容を優先して参照します。</div>}
      {FIELDS.map((f) => (
        <div className="field" key={f.key} style={{ marginBottom: 0 }}>
          <label>{f.label}</label>
          {f.hint && <div className="hint">{f.hint}</div>}
          <textarea name={f.key} defaultValue={initial[f.key]} rows={2} />
        </div>
      ))}
      <button className="btn btn-primary" disabled={pending}>
        {pending ? "保存中…" : "プロフィールを保存"}
      </button>
    </form>
  );
}
