import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function GET(req: NextRequest) {
  // Attempt to read any existing cookie
  const guessCookie = req.cookies.get("guestId");

  if (guessCookie) {
    // Cookie found; parse its JSON
    try {
      const { id, expiresAt } = JSON.parse(guessCookie.value);

      // If not yet expired, reuse the old ID
      if (Date.now() < expiresAt) {
        return NextResponse.json({ guestId: id });
      }
    } catch {
      // If for some reason we can't parse it, we'll just generate a new ID below
    }
  }

  // No valid guestId found (missing or expired) -> generate a new one
  const newGuestId = nanoid();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now

  // Stringify into cookie-friendly JSON
  const cookieValue = JSON.stringify({ id: newGuestId, expiresAt });

  // Construct response
  const response = NextResponse.json({ guestId: newGuestId });
  // Attach the Set-Cookie header with a 24-hour max age
  response.cookies.set("guestId", cookieValue, {
    httpOnly: true,
    maxAge: 24 * 60 * 60, // 24 hours in seconds
    path: "/",
  });

  return response;
}
