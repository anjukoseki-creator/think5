import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Full data export (spec §16). JSON by default; ?format=csv|md supported for
// the Raw Data table.
export async function GET(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [rawData, attempts, scores, profile, logs] = await Promise.all([
    prisma.rawData.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    prisma.logicAttempt.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    prisma.skillScore.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    prisma.userProfile.findUnique({ where: { userId: user.id } }),
    prisma.aiAccessLog.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
  ]);

  const url = new URL(req.url);
  const format = url.searchParams.get("format") || "json";
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === "csv") {
    const header = "id,category,aiAccessLevel,createdAt,content\n";
    const rows = rawData
      .map(
        (r) =>
          `${r.id},${r.category},${r.aiAccessLevel},${r.createdAt.toISOString()},"${r.content.replace(/"/g, '""')}"`
      )
      .join("\n");
    return new NextResponse(header + rows, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="think5-rawdata-${stamp}.csv"`,
      },
    });
  }

  if (format === "md") {
    const md =
      `# THINK5 データエクスポート (${stamp})\n\n## Raw Data\n\n` +
      rawData
        .map(
          (r) =>
            `### ${r.category} — ${r.createdAt.toISOString()}\n- AIアクセス: ${r.aiAccessLevel}\n\n\`\`\`\n${r.content}\n\`\`\`\n`
        )
        .join("\n");
    return new NextResponse(md, {
      headers: {
        "content-type": "text/markdown; charset=utf-8",
        "content-disposition": `attachment; filename="think5-export-${stamp}.md"`,
      },
    });
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    user: { id: user.id, email: user.email, name: user.name },
    profile,
    rawData,
    logicAttempts: attempts,
    skillScores: scores,
    aiAccessLogs: logs,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="think5-export-${stamp}.json"`,
    },
  });
}
