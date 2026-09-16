import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { getOrCreateStripeSession } from "@/lib/stripe-session";

/**
 * Mints a Stripe Connect account session for the signed-in user.
 *
 * This exists so the Stripe secret key stays on the server. The client hook
 * (useStripeConnect) calls this from fetchClientSecret, which Stripe re-invokes
 * whenever the account session expires — so this must remain callable, not a
 * one-off value baked into the page.
 *
 * The account id is taken from the server-side session rather than the request
 * body: accepting it from the caller would let any signed-in user mint a
 * session for somebody else's connected account.
 */
export async function GET() {
  const session = await getServerSession(options);

  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const accountId = session.stripeConnectId;
  if (!accountId) {
    return NextResponse.json(
      { error: "No Stripe Connect account for this user" },
      { status: 404 },
    );
  }

  try {
    const clientSecret = await getOrCreateStripeSession(accountId as string);
    return NextResponse.json({ clientSecret });
  } catch (error) {
    console.error("Failed to create Stripe account session:", error);
    return NextResponse.json(
      { error: "Failed to create Stripe session" },
      { status: 500 },
    );
  }
}
