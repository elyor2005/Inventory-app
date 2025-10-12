import { prisma } from "./prisma";

export async function getUserWithRole(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      blocked: true,
    },
  });

  return user;
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  const user = await getUserWithRole(userId);
  return user?.role === "admin" && !user.blocked;
}
