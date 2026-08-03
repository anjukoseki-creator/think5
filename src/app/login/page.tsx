"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthState } from "../actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginAction, {});

  return (
    <div className="center container">
      <div className="panel" style={{ width: 400, maxWidth: "100%" }}>
        <div className="brand" style={{ fontSize: 24, marginBottom: 4 }}>
          THINK<span>5</span>
        </div>
        <p className="muted small" style={{ marginTop: 0 }}>
          考える。決める。作る。伝える。自分を知る。
        </p>
        <div className="divider" />
        <form action={action} className="stack">
          {state.error && <div className="error">{state.error}</div>}
          <div className="field">
            <label>メールアドレス</label>
            <input type="email" name="email" required autoComplete="email" />
          </div>
          <div className="field">
            <label>パスワード</label>
            <input type="password" name="password" required autoComplete="current-password" />
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={pending}>
            {pending ? "サインイン中…" : "サインイン"}
          </button>
        </form>
        <p className="muted small" style={{ marginTop: 16 }}>
          アカウントがない場合は{" "}
          <Link href="/register" style={{ color: "var(--accent)" }}>
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}
