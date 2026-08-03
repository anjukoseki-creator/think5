import type { LogicAnswer, Problem, SubSkillKey } from "../logic";
import { SUB_SKILLS } from "../logic";
import type { Evaluation, Evaluator, Feedback } from "./types";

// --- text heuristics -----------------------------------------------------
const len = (s: string) => (s || "").trim().length;
const has = (s: string, re: RegExp) => re.test(s || "");
const count = (s: string, re: RegExp) => ((s || "").match(re) || []).length;

// diminishing-returns richness: reaches ~1.0 near `target` chars
const richness = (s: string, target: number) =>
  Math.min(1, len(s) / target);

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

// markers
const HAS_NUMBER = /[0-9０-９]|[一二三四五六七八九十百千万億%％円人件割倍]/;
const CAUSAL = /(なぜなら|ため|から|によって|要因|原因|影響|結果|つなが|起因|背景)/;
const STRUCTURE_WORDS = /(軸|観点|フレーム|フレームワーク|分類|カテゴリ|階層|要素|側面|MECE|①|②|1\.|2\.|・|-\s)/;
const QUESTION_FORM = /(か\?|か？|か$|何が|なぜ|どう|どこ|いつ|誰|どちら|べきか)/;
const HYPO_FORM = /(だろう|と考え|と思わ|仮説|はず|見込|可能性)/;

function scoreSubskills(a: LogicAnswer): Record<SubSkillKey, number> {
  // 論点設定
  const issue = clamp(
    richness(a.question, 40) * 55 +
      (has(a.question, QUESTION_FORM) ? 30 : 0) +
      (len(a.question) > 8 ? 15 : 0)
  );
  // 問題分解
  const decoBits = count(a.decomposition, /[、,・\n]|①|②|③|1\.|2\.|3\./g);
  const decomposition = clamp(
    richness(a.decomposition, 80) * 45 + Math.min(decoBits, 5) * 11
  );
  // 構造化
  const structure = clamp(
    richness(a.structure, 80) * 55 +
      (has(a.structure, STRUCTURE_WORDS) ? 35 : 0) +
      (len(a.structure) > 10 ? 10 : 0)
  );
  // 仮説構築
  const hypothesis = clamp(
    richness(a.hypothesis, 50) * 55 +
      (has(a.hypothesis, HYPO_FORM) ? 25 : 0) +
      (has(a.hypothesis, HAS_NUMBER) ? 20 : 0)
  );
  // 因果関係
  const causalText = `${a.decomposition} ${a.evidence} ${a.conclusion}`;
  const causality = clamp(
    richness(causalText, 120) * 45 + Math.min(count(causalText, CAUSAL), 4) * 14
  );
  // 根拠・定量性
  const evidence = clamp(
    richness(a.evidence, 70) * 45 +
      (has(a.evidence, HAS_NUMBER) ? 45 : 0) +
      (len(a.evidence) > 15 ? 10 : 0)
  );
  // 反証・批判的思考
  const critique = clamp(
    richness(a.objection, 40) * 35 +
      richness(a.rebuttal, 40) * 35 +
      (len(a.objection) > 5 && len(a.rebuttal) > 5 ? 30 : 0)
  );

  return { issue, decomposition, structure, hypothesis, causality, evidence, critique };
}

function weakestStrongest(sub: Record<SubSkillKey, number>) {
  const entries = SUB_SKILLS.map((s) => ({ ...s, v: sub[s.key] }));
  const sorted = [...entries].sort((a, b) => a.v - b.v);
  return { weakest: sorted[0], strongest: sorted[sorted.length - 1] };
}

function buildFeedback(
  problem: Problem,
  a: LogicAnswer,
  sub: Record<SubSkillKey, number>
): Feedback {
  const { weakest, strongest } = weakestStrongest(sub);
  const hasNumbers = has(a.evidence, HAS_NUMBER);
  const hasObjection = len(a.objection) > 5;
  const hasRebuttal = len(a.rebuttal) > 5;
  const hasCausal = has(`${a.evidence} ${a.conclusion}`, CAUSAL);

  return {
    good:
      `「${strongest.label}」が相対的な強みでした（${strongest.v}点）。` +
      (hasNumbers
        ? "根拠に具体的な数値を織り込めている点は説得力につながっています。"
        : `${strongest.desc}という観点が読み取れます。`),
    improve:
      `最も伸びしろがあるのは「${weakest.label}」（${weakest.v}点）です。${weakest.desc}を意識して書き直すと全体の質が上がります。`,
    logicalLeap: hasCausal
      ? "根拠から結論への流れはおおむね追えますが、途中の前提を1つ明示するとさらに飛躍が減ります。"
      : "根拠と結論の間に説明されていないステップがあります。『なぜその根拠から、その結論が言えるのか』を一文で埋めてください。",
    weakEvidence: hasNumbers
      ? "数値は使えていますが、その数字の出所（前提・仮定）が書かれていません。推定なら推定と明記しましょう。"
      : "主張を支える定量的な根拠がほとんどありません。1つでよいので数字（規模・割合・件数など）を置いてください。",
    counterArgument: `想定される反論：「${problem.title}」の状況では、あなたの結論とは逆に別の要因が支配的かもしれません。この反論に一言で答えられますか？`,
    blindSpot: pickBlindSpot(problem),
    nextQuestion: `次に考えるべき問い：もし前提が1つ崩れたら（例：${weakest.label}の見立てが外れたら）、結論はどう変わりますか？`,
    action: hasObjection && hasRebuttal
      ? `反論・再反論は書けています。次回は「${weakest.label}」に絞り、その部分だけを3パターン書き比べてみてください。`
      : `具体アクション：今回空欄に近かった『反論』と『再反論』を必ず各1文以上書く。自分の結論を一番強く否定する立場を演じてみましょう。`,
  };
}

function pickBlindSpot(problem: Problem): string {
  const map: Record<string, string> = {
    "Case Study": "「そもそも売上減は市場全体か、自店だけか」という外部環境の切り分けが見落とされがちです。",
    "New Business": "「本当にお金を払ってでも解決したい課題か（Willingness to pay）」の検証視点が抜けやすいです。",
    "Fermi Estimation": "推定の感度（どの前提が結果を最も左右するか）への言及が抜けがちです。",
    "Product Improvement": "「その不満を言っていないサイレントな多数派」への影響が見落とされがちです。",
    "News Analysis": "「誰が得をし、誰が損をするのか」という利害関係者の視点が抜けやすいです。",
    Career: "「本人が何を大事にしたいか（価値観）」を判断基準に入れられているかを確認しましょう。",
    "Daily Decision": "金銭・時間だけでなく『可逆性（後で戻せるか）』という視点が見落とされがちです。",
  };
  return map[problem.category] || "反対の立場に立つ人の視点が十分に検討されていません。";
}

export class MockEvaluator implements Evaluator {
  readonly name = "mock";

  async evaluate(problem: Problem, answer: LogicAnswer): Promise<Evaluation> {
    const subScores = scoreSubskills(answer);
    const total = clamp(
      SUB_SKILLS.reduce((s, k) => s + subScores[k.key], 0) / SUB_SKILLS.length
    );
    const feedback = buildFeedback(problem, answer, subScores);
    const { weakest } = weakestStrongest(subScores);
    const summary =
      total >= 80
        ? `安定して論理を組み立てられています。次は「${weakest.label}」を磨けば更に伸びます。`
        : total >= 55
          ? `骨格は作れています。特に「${weakest.label}」が今の伸びしろです。`
          : `まず型に沿って各項目を埋めることから。「${weakest.label}」を重点的に。`;

    return { subScores, totalScore: total, feedback, summary, provider: "mock" };
  }
}
