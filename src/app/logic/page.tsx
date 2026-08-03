import { requireUser } from "@/lib/auth";
import NavBar from "@/components/NavBar";
import { pickProblem } from "@/lib/logic";
import LogicTrainer from "./LogicTrainer";

export const dynamic = "force-dynamic";

export default async function LogicPage() {
  const user = await requireUser();
  // New random problem each visit (spec: "AIが問題を生成").
  const problem = pickProblem();

  return (
    <>
      <NavBar active="/logic" name={user.name} />
      <main className="container" style={{ padding: "24px 20px 60px", maxWidth: 760 }}>
        <LogicTrainer problem={problem} />
      </main>
    </>
  );
}
