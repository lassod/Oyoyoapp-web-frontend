import { CollectionOptions } from "@stripe/connect-js";
import Stripe from "stripe";

const stripe = new Stripe(
  "sk_test_51P8Se808P4tFOkILPQG44jgXF3v1KNDkXdNF4sc2QoIJrOyJhRzzyuJ1xSoUk6BboCV3IMeyF4XUkUYND5lm8qvE00LfseM8ED",
  {
    apiVersion: "2024-06-20",
  }
);
// const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
//   apiVersion: "2024-06-20",
// });

export async function getOrCreateStripeSession(accountId: string) {
  console.log("accountSession");
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
    console.log(accountSession);
    return accountSession.client_secret;
  } catch (error) {
    console.error("Error creating Stripe account session:", error);
    throw new Error("Failed to create Stripe session. Please check the configuration.");
  }
}

export const collectionOptions: CollectionOptions = {
  fields: "currently_due",
  futureRequirements: "include",
};
