import { NextResponse } from "next/server";
import { ensureUserSynced, getCurrentUserWithSync } from "@/lib/user-sync";

/**
 * GET /api/auth/sync
 * Syncs the current authenticated user from Stack Auth to Neon database.
 * Returns the synced user information.
 */
export async function GET() {
  try {
    const user = await getCurrentUserWithSync();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user,
      message: "User synced successfully",
    });
  } catch (error) {
    console.error("Error in sync route:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}

/**
 * POST /api/auth/sync
 * Forces a sync of the current user to Neon database.
 */
export async function POST() {
  try {
    const userId = await ensureUserSynced();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      userId,
      message: "User synced successfully",
    });
  } catch (error) {
    console.error("Error in sync route:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
