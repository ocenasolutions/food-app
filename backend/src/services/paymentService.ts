import { env } from "../config/env.js";

export async function createPaymentIntent(input: {
  provider: "stripe" | "razorpay" | "cash";
  amount: number;
  currency: string;
  orderId?: string;
}) {
  if (input.provider === "cash") {
    return {
      provider: "cash",
      status: "created",
      amount: input.amount,
      currency: input.currency,
      clientSecret: null
    };
  }

  if (input.provider === "stripe" && env.stripeSecretKey) {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(env.stripeSecretKey);
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(input.amount * 100),
      currency: input.currency.toLowerCase(),
      metadata: { orderId: input.orderId ?? "" }
    });
    return { provider: "stripe", status: intent.status, clientSecret: intent.client_secret };
  }

  return {
    provider: input.provider,
    status: "gateway_not_configured",
    amount: input.amount,
    currency: input.currency,
    clientSecret: null
  };
}
