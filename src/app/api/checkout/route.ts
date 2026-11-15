import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Stripe API key missing" }, { status: 500 });
    }

    const stripe = new Stripe(secretKey);

    const body = await req.json();
    const activeTb = Number(body.activeTb) || 1;
    const archiveTb = Number(body.archiveTb) || 0;

    const activeCost = 29 + Math.max(0, activeTb - 1) * 20;
    const archiveCost = archiveTb * 5;
    const totalCents = (activeCost + archiveCost) * 100;

    const origin = req.headers.get("origin") || "https://cloudlock.ai";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `CloudLock VFS (${activeTb} TB Active + ${archiveTb} TB Deep Vault)`,
              description: "Zero-Knowledge Virtual Drive Z:\\ for Windows. 14-day free pilot included.",
            },
            unit_amount: totalCents,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
      },
      success_url: `${origin}/studio?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe error:", err);
    return NextResponse.json({ error: err.message || "Failed to create session" }, { status: 500 });
  }
}