"use server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const FIELDS = [
  "coreValues",
  "strengths",
  "weaknesses",
  "currentGoals",
  "currentFocus",
  "decisionPatterns",
  "learningPatterns",
  "behavioralTendencies",
] as const;

export type ProfileState = { ok?: boolean };

export async function saveProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const user = await requireUser();
  const data: Record<string, string> = {};
  for (const f of FIELDS) data[f] = String(formData.get(f) || "").trim();

  await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: data,
    create: { userId: user.id, ...data },
  });

  revalidatePath("/profile");
  return { ok: true };
}
