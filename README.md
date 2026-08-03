# THINK5 — Personal Growth OS (Phase 1 MVP)

> 考える。決める。作る。伝える。自分を知る。

個人の思考力を長期的に育てる Personal Growth OS。本リポジトリは仕様の **Phase 1 MVP** です。

## 実装済み（Phase 1）

- **Authentication** — メール/パスワード + 署名付きセッション Cookie（bcrypt / JWT）
- **Database** — Prisma + SQLite（3レイヤー構造。後で PostgreSQL + pgvector へ差替可能な設計）
- **Raw Data（Layer 1）** — 入力を原本のまま保存
- **Privacy Level** — 各データに `PRIVATE / MEMORY / CONTEXT` を設定・変更可能
- **User Profile（Layer 3）** — ユーザーが所有・編集する自己理解の要約
- **LOGIC Training** — 7カテゴリの問題 × 9ステップ回答フロー
- **AI Evaluation** — 7サブスキル採点 + 8要素フィードバック（無条件肯定しないコーチ）
- **Score / Growth Graph** — 直近平均でLOGICスコアを算出、成長グラフ表示、弱点自動検出
- **透明性 / データ管理** — AIアクセスログ、全データエクスポート（JSON/CSV/Markdown）、削除・アカウント削除

## AI評価エンジンの切替

デフォルトは **モック評価**（APIキー不要・ヒューリスティック採点）。実AIに切り替えるには `.env` を編集：

```env
AI_PROVIDER="anthropic"
ANTHROPIC_API_KEY="sk-ant-..."
ANTHROPIC_MODEL="claude-opus-4-8"
```

`src/lib/ai/` の `Evaluator` インターフェースに実装を足すだけで OpenAI 等も追加できます。

## セットアップ

```bash
npm install
npm run setup   # prisma generate + db push + seed（デモユーザー作成）
npm run dev
```

http://localhost:3000 を開く。デモアカウント: `demo@think5.app` / `demo1234`（または新規登録）。

## アーキテクチャ

```
src/
  lib/
    auth.ts        セッション / 認可
    db.ts          Prisma クライアント
    logic.ts       7サブスキル・問題バンク・回答スキーマ
    stats.ts       スコア集計（弱点検出・成長比較）
    ai/            評価エンジン（interface + mock + anthropic + factory）
  app/
    login, register        認証
    dashboard              5能力・成長グラフ・弱点/強み・今日のミッション
    logic                  LOGICトレーニング（9ステップ→AI評価→保存）
    profile                User Profile 編集
    data                   プライバシー / 透明性 / エクスポート / 削除
    api/export             データエクスポート
```

## セキュリティ

- AI APIキーはサーバ側のみ（クライアントに露出しない）
- 全クエリを `userId` でスコープ（ユーザー間のデータ分離）
- 削除はカスケードで Raw Data / Score / Profile / ログまで消去

## 今後（Phase 2+）

Structured Memory（Layer 2）/ Memory Correction / RAG（pgvector）/ EXPRESS・DECIDE・WHY・BUILD。
Prisma のモデルはこの拡張を見込んだ形にしてあります。
