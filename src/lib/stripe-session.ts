import Stripe from "stripe";

/**
 * Server-only. STRIPE_SECRET_KEY deliberately has no NEXT_PUBLIC_ prefix —
 * that prefix inlines a value into the browser bundle, which for a Stripe
 * secret key means publishing the ability to move money. Reach this module
 * from server code only; the browser goes via GET /api/stripe/account-session.
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function getOrCreateStripeSession(accountId: string) {
  try {
    const accountSession = await stripe.accountSessions.create({
      account: accountId,
      components: {
        payouts_list: {
          enabled: true,
        },
        documents: {
          enabled: true,
        },
        account_onboarding: {
          enabled: true,
          features: {
            external_account_collection: true,
          },
        },
        notification_banner: {
          enabled: true,
          features: {
            external_account_collection: true,
          },
        },
        payments: {
          enabled: true,
          features: {
            refund_management: true,
            dispute_management: true,
            capture_payments: true,
            destination_on_behalf_of_charge_management: false,
          },
        },
        account_management: {
          enabled: true,
          features: {
            external_account_collection: true,
          },
        },
        balances: {
          enabled: true,
          features: {
            instant_payouts: true,
            standard_payouts: true,
            edit_payout_schedule: true,
          },
        },

        payment_details: {
          enabled: true,
          features: {
            refund_management: true,
            dispute_management: true,
            capture_payments: true,
            destination_on_behalf_of_charge_management: false,
          },
        },
      },
    });
    return accountSession.client_secret;
  } catch (error) {
    console.error("Error creating Stripe account session:", error);
    throw new Error("Failed to create Stripe session. Please check the configuration.");
  }
}