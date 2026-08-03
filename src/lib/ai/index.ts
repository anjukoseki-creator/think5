import type { Evaluator } from "./types";
import { MockEvaluator } from "./mock";
import { AnthropicEvaluator } from "./anthropic";

export * from "./types";

// Factory: swap the evaluator via AI_PROVIDER env var without touching callers.
export function getEvaluator(): Evaluator {
  const provider = (process.env.AI_PROVIDER || "mock").toLowerCase();
  switch (provider) {
    case "anthropic":
      return new AnthropicEvaluator();
    case "mock":
    default:
      return new MockEvaluator();
  }
}
