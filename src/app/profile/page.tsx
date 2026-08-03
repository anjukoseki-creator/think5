import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import ProfileForm, { type ProfileData } from "./ProfileForm";

export const dynamic = "force-dynamic";

const EMPTY: ProfileData = {
  coreValues: "",
  strengths: "",
  weaknesses: "",
  currentGoals: "",
  currentFocus: "",
  decisionPatterns: "",
  learningPatterns: "",
  behavioralTendencies: "",
};

export default async function ProfilePage() {
  const user = await requireUser();
  const p = await prisma.userProfile.findUnique({ where: { userId: user.id } });

  const initial: ProfileData = p
    ? {
        coreValues: p.coreValues,
        strengths: p.strengths,
        weaknesses: p.weaknesses,
        currentGoals: p.currentGoals,
        currentFocus: p.currentFocus,
        decisionPatterns: p.decisionPatterns,
        learningPatterns: p.learningPatterns,
        behavioralTendencies: p.behavioralTendencies,
      }
    : EMPTY;

  return (
    <>
      <NavBar active="/profile" name={user.name} />
      <main className="container" style={{ padding: "24px 20px 60px", maxWidth: 760 }}>
        <ProfileForm initial={initial} />
      </main>
    </>
  );
}
