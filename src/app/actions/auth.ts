"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

export type AuthState = { error?: string };

export async function registerAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  if (!name || !email || !password) return { error: "すべての項目を入力してください。" };
  if (password.length < 6) return { error: "パスワードは6文字以上にしてください。" };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "このメールアドレスは既に登録されています。" };

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      profile: { create: {} },
    },
  });

  await createSession({ id: user.id, email: user.email, name: user.name });
  redirect("/dashboard");
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "メールアドレスまたはパスワードが正しくありません。" };
  }

  await createSession({ id: user.id, email: user.email, name: user.name });
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
