"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthState } from "../actions/auth";

export default function RegisterPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(registerAction, {});

  return (
    <div className="center container">
      <div className="panel" style={{ width: 400, maxWidth: "100%" }}>
        <div className="brand" style={{ fontSize: 24, marginBottom: 4 }}>
          THINK<span>5</span>
        </div>
        <p className="muted small" style={{ marginTop: 0 }}>
          あなた専用のPersonal Growth OSを始める
        </p>
        <div className="divider" />
        <form action={action} className="stack">
          {state.error && <div className="error">{state.error}</div>}
          <div className="field">
            <label>お名前</label>
            <input type="text" name="name" required autoComplete="name" />
          </div>
          <div className="field">
            <label>メールアドレス</label>
            <input type="email" name="email" required autoComplete="email" />
          </div>
          <div className="field">
            <label>パスワード（6文字以上）</label>
            <input type="password" name="password" required autoComplete="new-password" />
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={pending}>
            {pending ? "作成中…" : "アカウントを作成"}
          </button>
        </form>
        <p className="muted small" style={{ marginTop: 16 }}>
          すでにアカウントをお持ちの場合は{" "}
          <Link href="/login" style={{ color: "var(--accent)" }}>
            サインイン
          </Link>
        </p>
      </div>
    </div>
  );
}
