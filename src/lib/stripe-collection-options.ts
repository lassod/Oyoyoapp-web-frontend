import { CollectionOptions } from "@stripe/connect-js";

/**
 * Lives apart from stripe-session.ts on purpose: this is imported by client
 * components, and importing it from the module that instantiates the Stripe
 * SDK would pull the server-side client into the browser bundle.
 */
export const collectionOptions: CollectionOptions = {
  fields: "currently_due",
  futureRequirements: "include",
};
