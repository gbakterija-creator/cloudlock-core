import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id parameter" }, { status: 400 });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Stripe key missing" }, { status: 500 });
    }

    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "subscription"],
    });

    const lineItem = session.line_items?.data?.[0];
    const planName = lineItem?.description || "CloudLock VFS Professional";
    const customerEmail = session.customer_details?.email || session.customer_email || "studio@client.internal";

    return NextResponse.json({
      valid: true,
      status: session.status,
      paymentStatus: session.payment_status,
      customerEmail,
      planName,
      amountTotal: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency?.toUpperCase() || "EUR",
      trialEnd: (session.subscription as any)?.trial_end || null,
    });
  } catch (err: any) {
    console.error("Session verification error:", err);
    return NextResponse.json({ valid: false, error: err.message }, { status: 404 });
  }
}