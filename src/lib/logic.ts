// LOGIC domain definitions: the 7 sub-skills, the structured answer shape,
// and the problem bank. Kept separate from evaluation logic.

export type SubSkillKey =
  | "issue" // 論点設定
  | "decomposition" // 問題分解
  | "structure" // 構造化
  | "hypothesis" // 仮説構築
  | "causality" // 因果関係
  | "evidence" // 根拠・定量性
  | "critique"; // 反証・批判的思考

export const SUB_SKILLS: { key: SubSkillKey; label: string; desc: string }[] = [
  { key: "issue", label: "論点設定", desc: "解くべき問いを的確に定義できているか" },
  { key: "decomposition", label: "問題分解", desc: "問題をMECEに分解できているか" },
  { key: "structure", label: "構造化", desc: "情報を階層・枠組みで整理できているか" },
  { key: "hypothesis", label: "仮説構築", desc: "検証可能で具体的な仮説を立てているか" },
  { key: "causality", label: "因果関係", desc: "原因と結果の関係を筋道立てて示せているか" },
  { key: "evidence", label: "根拠・定量性", desc: "主張を数値・事実で裏づけているか" },
  { key: "critique", label: "反証・批判的思考", desc: "自説への反論と再反論を用意できているか" },
];

// The 9-step structured answer (spec §17).
export type LogicAnswer = {
  question: string; // 1. 問いを定義
  target: string; // 2. 対象を定義
  hypothesis: string; // 3. 仮説
  decomposition: string; // 4. 問題分解
  structure: string; // 5. 構造化
  evidence: string; // 6. 根拠
  conclusion: string; // 7. 結論
  objection: string; // 8. 反論
  rebuttal: string; // 9. 再反論
};

export const ANSWER_FIELDS: {
  key: keyof LogicAnswer;
  label: string;
  hint: string;
}[] = [
  { key: "question", label: "1. 問いを定義", hint: "この問題で本当に答えるべき問いは何か？" },
  { key: "target", label: "2. 対象を定義", hint: "誰の / 何を対象に考えるか。範囲・前提を明確に。" },
  { key: "hypothesis", label: "3. 仮説", hint: "現時点での答えの見立て（検証可能な形で）。" },
  { key: "decomposition", label: "4. 問題分解", hint: "問題を要素に分解する（漏れ・重複なく）。" },
  { key: "structure", label: "5. 構造化", hint: "分解した要素を枠組み・階層で整理する。" },
  { key: "evidence", label: "6. 根拠", hint: "主張を支える事実・数値・ロジック。" },
  { key: "conclusion", label: "7. 結論", hint: "結論ファーストで、問いへの答えを一文で。" },
  { key: "objection", label: "8. 反論", hint: "自分の結論に対する最も強い反対意見。" },
  { key: "rebuttal", label: "9. 再反論", hint: "その反論にどう応えるか。" },
];

export type Problem = {
  id: string;
  category: string;
  title: string;
  prompt: string;
};

export const PROBLEM_BANK: Problem[] = [
  {
    id: "case-cafe",
    category: "Case Study",
    title: "売上が落ちたカフェ",
    prompt:
      "駅前のカフェの売上が、半年で20%減少しました。あなたが店長なら、原因をどう特定し、どんな打ち手を打ちますか？",
  },
  {
    id: "newbiz-senior",
    category: "New Business",
    title: "高齢者向け新規事業",
    prompt:
      "スマホに不慣れな高齢者が抱える課題を1つ選び、それを解決する新規事業を提案してください。誰の何を解決するのかを明確に。",
  },
  {
    id: "fermi-umbrella",
    category: "Fermi Estimation",
    title: "傘の年間販売本数",
    prompt: "日本国内で1年間に販売されるビニール傘の本数を推定してください。前提と計算過程を示すこと。",
  },
  {
    id: "improve-notif",
    category: "Product Improvement",
    title: "通知が多すぎるアプリ",
    prompt:
      "あるSNSアプリで「通知が多すぎて疲れる」という不満が増えています。どう改善しますか？優先順位もつけてください。",
  },
  {
    id: "news-remote",
    category: "News Analysis",
    title: "リモートワーク回帰",
    prompt:
      "大企業が「オフィス出社」に戻す動きが増えています。この動きの背景を構造的に分析し、あなたの見解を述べてください。",
  },
  {
    id: "career-offer",
    category: "Career",
    title: "2つの内定",
    prompt:
      "安定した大企業と、成長中だが不安定なスタートアップ。2つの内定で迷う後輩に、どう意思決定を助言しますか？判断基準を示すこと。",
  },
  {
    id: "daily-commute",
    category: "Daily Decision",
    title: "引っ越すべきか",
    prompt:
      "通勤に片道90分かかっています。会社の近くへ引っ越すべきか。考慮すべき論点を整理し、結論を出してください。",
  },
];

export function getProblem(id: string): Problem | undefined {
  return PROBLEM_BANK.find((p) => p.id === id);
}

export function pickProblem(seed?: number): Problem {
  const i =
    seed !== undefined
      ? seed % PROBLEM_BANK.length
      : Math.floor(Math.random() * PROBLEM_BANK.length);
  return PROBLEM_BANK[i];
}
