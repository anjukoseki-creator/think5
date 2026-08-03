"use server";

import { requireUser, destroySession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function setAiAccessLevel(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  const level = String(formData.get("level") || "MEMORY");
  // Authorization: only update rows owned by this user.
  await prisma.rawData.updateMany({
    where: { id, userId: user.id },
    data: { aiAccessLevel: level },
  });
  revalidatePath("/data");
}

export async function deleteRawData(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  await prisma.rawData.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/data");
}

export async function deleteCategory(formData: FormData) {
  const user = await requireUser();
  const category = String(formData.get("category") || "");
  await prisma.rawData.deleteMany({ where: { userId: user.id, category } });
  revalidatePath("/data");
}

export async function clearAiLogs() {
  const user = await requireUser();
  await prisma.aiAccessLog.deleteMany({ where: { userId: user.id } });
  revalidatePath("/data");
}

export async function deleteAccount() {
  const user = await requireUser();
  // Cascade deletes RawData, attempts, scores, profile, logs (schema onDelete: Cascade).
  await prisma.user.delete({ where: { id: user.id } });
  await destroySession();
  redirect("/register");
}
