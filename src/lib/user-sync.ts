import { stackServerApp } from "@/stack/server";
import db, { sql } from "@/db/index";
import { usersSync } from "drizzle-orm/neon";
import { eq } from "drizzle-orm";

/**
 * Ensures the current Stack Auth user is synced to Neon's usersSync table.
 * Returns the user ID if successful, or null if user is not authenticated.
 */
export async function ensureUserSynced(): Promise<string | null> {
  const user = await stackServerApp.getUser();

  if (!user) {
    return null;
  }

  try {
    // Check if user already exists in usersSync
    let existingUser: Array<{ id: string }>;
    try {
      existingUser = await db
        .select({ id: usersSync.id })
        .from(usersSync)
        .where(eq(usersSync.id, user.id))
        .limit(1);
    } catch (queryError) {
      console.error("Error querying usersSync table:", queryError);
      throw new Error(
        `Failed to query usersSync table. Make sure the table exists and is accessible. Error: ${queryError instanceof Error ? queryError.message : String(queryError)}`
      );
    }

    // User doesn't exist, insert into usersSync
    // usersSync table has: id, email, name, created_at (no updated_at column)
    const userEmail = user.primaryEmail || null;
    const userName = user.displayName || null;

    try {
      console.log(
        `Attempting to insert/update user ${user.id} into usersSync...`
      );
      const result = await sql.query(
        `INSERT INTO neon_auth.users_sync (id, email, name, created_at) 
         VALUES ($1, $2, $3, now()) 
         ON CONFLICT (id) DO UPDATE SET 
           email = EXCLUDED.email,
           name = EXCLUDED.name`,
        [user.id, userEmail, userName]
      );
      console.log(`Insert result for user ${user.id}:`, result);

      // Verify the user was actually inserted/updated
      const verifyUser = await db
        .select({ id: usersSync.id })
        .from(usersSync)
        .where(eq(usersSync.id, user.id))
        .limit(1);

      if (verifyUser.length === 0) {
        throw new Error(
          `Failed to verify user insertion for ID: ${user.id}. User was not found after INSERT operation.`
        );
      }

      if (existingUser.length > 0) {
        console.log(
          `User ${user.id} already exists in usersSync, name updated if changed`
        );
      } else {
        console.log(`User ${user.id} successfully synced to Neon`);
      }
      return user.id;
    } catch (insertError) {
      console.error("Error inserting user into usersSync:", insertError);
      // If it's a conflict error, the user might have been inserted by another request
      // Check again if user exists now
      const retryCheck = await db
        .select({ id: usersSync.id })
        .from(usersSync)
        .where(eq(usersSync.id, user.id))
        .limit(1);

      if (retryCheck.length > 0) {
        return user.id;
      }

      // If still not found, throw the error
      throw new Error(
        `Failed to sync user to Neon: ${insertError instanceof Error ? insertError.message : String(insertError)}`
      );
    }
  } catch (error) {
    console.error("Error syncing user to Neon:", error);
    throw error; // Re-throw to prevent silent failures
  }
}

/**
 * Gets the current user from Stack Auth and ensures they're synced to Neon.
 * Returns user information including ID, email, and other available fields.
 */
export async function getCurrentUserWithSync() {
  const user = await stackServerApp.getUser();

  if (!user) {
    return null;
  }

  // Ensure user is synced
  await ensureUserSynced();

  // Return user data from Stack Auth
  return {
    id: user.id,
    email: user.primaryEmail || null,
    displayName: user.displayName || null,
    profileImageUrl: user.profileImageUrl || null,
    // Add other user fields as needed
  };
}

/**
 * Gets all users from Neon's usersSync table.
 * This gives you access to all Stack Auth users that have been synced.
 */
export async function getAllSyncedUsers() {
  try {
    const users = await db.select().from(usersSync);

    return users;
  } catch (error) {
    console.error("Error fetching synced users:", error);
    return [];
  }
}
