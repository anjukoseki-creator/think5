import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import {
  setAiAccessLevel,
  deleteRawData,
  clearAiLogs,
  deleteAccount,
} from "./actions";

export const dynamic = "force-dynamic";

const LEVEL_LABEL: Record<string, string> = {
  PRIVATE: "🔒 PRIVATE",
  MEMORY: "MEMORY",
  CONTEXT: "CONTEXT",
};

export default async function DataPage() {
  const user = await requireUser();
  const [rawData, logs] = await Promise.all([
    prisma.rawData.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.aiAccessLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <>
      <NavBar active="/data" name={user.name} />
      <main className="container" style={{ padding: "24px 20px 60px" }}>
        <div className="panel" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>データエクスポート</h3>
          <p className="small muted">
            あなたのデータはあなたのものです。いつでも全データを書き出せます。
          </p>
          <div className="row">
            <a className="btn" href="/api/export?format=json">JSON</a>
            <a className="btn" href="/api/export?format=csv">CSV（Raw Data）</a>
            <a className="btn" href="/api/export?format=md">Markdown</a>
          </div>
        </div>

        {/* Raw Data with privacy level control */}
        <div className="panel" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Raw Data（Layer 1）とプライバシー設定</h3>
          <p className="small muted">
            各データのAIアクセスレベルを変更・削除できます。PRIVATEはAIに一切送信されません。
          </p>
          {rawData.length === 0 && <p className="muted small">まだデータがありません。</p>}
          {rawData.map((r) => (
            <div
              key={r.id}
              className="row spread"
              style={{ padding: "10px 0", borderBottom: "1px solid var(--border)", gap: 10 }}
            >
              <div style={{ maxWidth: "48%" }}>
                <span className="pill">{r.category}</span>{" "}
                <span className="pill">{LEVEL_LABEL[r.aiAccessLevel] ?? r.aiAccessLevel}</span>
                <div className="small muted" style={{ marginTop: 4 }}>
                  {r.content.slice(0, 70)}
                  {r.content.length > 70 ? "…" : ""}
                </div>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <form action={setAiAccessLevel} className="row" style={{ gap: 6 }}>
                  <input type="hidden" name="id" value={r.id} />
                  <select name="level" defaultValue={r.aiAccessLevel} style={miniSelect}>
                    <option value="PRIVATE">PRIVATE</option>
                    <option value="MEMORY">MEMORY</option>
                    <option value="CONTEXT">CONTEXT</option>
                  </select>
                  <button className="btn small" style={miniBtn}>変更</button>
                </form>
                <form action={deleteRawData}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="btn small" style={{ ...miniBtn, color: "var(--bad)" }}>
                    削除
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>

        {/* AI Access Log — transparency */}
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="row spread">
            <h3 style={{ margin: 0 }}>AIアクセスログ（透明性）</h3>
            <form action={clearAiLogs}>
              <button className="btn small" style={miniBtn}>ログを消去</button>
            </form>
          </div>
          <p className="small muted">AIがいつ・何のためにデータを参照したかの記録です。</p>
          {logs.length === 0 && <p className="muted small">記録はありません。</p>}
          {logs.map((l) => (
            <div key={l.id} className="row spread small" style={{ padding: "6px 0" }}>
              <span>{l.purpose}</span>
              <span className="muted">
                {l.provider} · {l.createdAt.toLocaleString("ja-JP")}
              </span>
            </div>
          ))}
        </div>

        {/* Danger zone */}
        <div className="panel" style={{ borderColor: "var(--bad)" }}>
          <h3 style={{ marginTop: 0, color: "var(--bad)" }}>アカウント削除</h3>
          <p className="small muted">
            アカウントと、関連するすべてのRaw Data・スコア・プロフィール・ログを完全に削除します。この操作は取り消せません。
          </p>
          <form action={deleteAccount}>
            <button className="btn" style={{ borderColor: "var(--bad)", color: "var(--bad)" }}>
              アカウントを完全に削除する
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

const miniSelect: React.CSSProperties = {
  background: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text)",
  padding: "5px 8px",
  fontSize: 12,
};
const miniBtn: React.CSSProperties = { padding: "5px 10px", fontSize: 12 };
