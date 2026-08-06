import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const user = await requireUser();
  const attempts = await prisma.logicAttempt.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      problemText: true,
      category: true,
      totalScore: true,
      aiProvider: true,
      createdAt: true,
    },
  });

  return (
    <>
      <NavBar active="/history" name={user.name} />
      <main className="container" style={{ padding: "24px 20px 60px", maxWidth: 820 }}>
        <div className="panel">
          <div className="row spread">
            <h3 style={{ margin: 0 }}>トレーニング履歴</h3>
            <Link href="/logic" className="btn btn-primary small" style={{ padding: "6px 12px" }}>
              新しく解く →
            </Link>
          </div>
          <p className="small muted">
            過去の回答とAIフィードバックをいつでも見返せます。行をクリックすると詳細が開きます。
          </p>

          {attempts.length === 0 && (
            <p className="muted small" style={{ padding: "24px 0", textAlign: "center" }}>
              まだ履歴がありません。LOGICを1問解くとここに残ります。
            </p>
          )}

          {attempts.map((a) => (
            <Link
              key={a.id}
              href={`/history/${a.id}`}
              className="row spread history-row"
              style={{
                padding: "12px 6px",
                borderBottom: "1px solid var(--border)",
                gap: 12,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ maxWidth: "72%" }}>
                <span className="tag">{a.category}</span>
                <div className="small" style={{ marginTop: 4 }}>
                  {a.problemText.slice(0, 64)}
                  {a.problemText.length > 64 ? "…" : ""}
                </div>
              </div>
              <div className="row" style={{ gap: 10 }}>
                <span className="muted small">{a.createdAt.toLocaleDateString("ja-JP")}</span>
                <span className="pill" style={{ color: "var(--logic)", fontWeight: 700 }}>
                  {a.totalScore}点
                </span>
                <span className="muted" style={{ fontSize: 18 }}>
                  ›
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
