import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";

const LINKS = [
  { href: "/dashboard", label: "ダッシュボード" },
  { href: "/logic", label: "LOGIC" },
  { href: "/profile", label: "プロフィール" },
  { href: "/data", label: "データ管理" },
];

export default function NavBar({ active, name }: { active: string; name: string }) {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link href="/dashboard" className="brand">
          THINK<span>5</span>
        </Link>
        <div className="nav-links">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link ${active === l.href ? "active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <span className="muted small" style={{ marginRight: 10 }}>
          {name}
        </span>
        <form action={logoutAction}>
          <button className="btn btn-ghost small" style={{ padding: "6px 12px" }}>
            ログアウト
          </button>
        </form>
      </div>
    </nav>
  );
}
