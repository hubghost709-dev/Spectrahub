import { currentUser } from "@clerk/nextjs";
import { db } from "./db";
import type { User, Stream } from "@prisma/client";

// Tipado explícito del tipo devuelto por Clerk
interface ClerkUser {
  id: string;
  username: string;
}

/**
 * Función que garantiza que el usuario de Clerk está autenticado y tiene username
 */
const requireCurrentClerkUser = async (): Promise<ClerkUser> => {
  const user = await currentUser();
  if (!user || !user.username) {
    throw new Error("Unauthorized: user not found or missing username");
  }

  return { id: user.id, username: user.username };
};

/**
 * Devuelve al usuario autenticado desde la base de datos
 */
export const getSelf = async (): Promise<User & { stream: Stream | null }> => {
  const clerkUser = await requireCurrentClerkUser();

  const user = await db.user.findUnique({
    where: { externalUserId: clerkUser.id },
    include: { stream: true },
  });

  if (!user) {
    throw new Error(`User not found with Clerk ID: ${clerkUser.id}`);
  }

  return user;
};

/**
 * Devuelve al usuario por username si coincide con el de la sesión
 */
export const getSelfByUsername = async (
  username: string
): Promise<User & { stream: Stream | null }> => {
  const clerkUser = await requireCurrentClerkUser();

  const user = await db.user.findUnique({
    where: { username },
    include: { stream: true },
  });

  if (!user) {
    throw new Error(`User not found with username: ${username}`);
  }

  if (clerkUser.username !== user.username) {
    throw new Error("Unauthorized: usernames do not match");
  }

  return user;
};
