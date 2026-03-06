import { Webhook } from "svix";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Event = {
  type: string;
  data: {
    id: string;
    first_name: string;
    last_name: string;
    email_addresses: { email_address: string }[];
  };
};

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_KEY;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Missing webhook secret" },
      { status: 400 },
    );
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing headers" }, { status: 400 });
  }
  const webhook = new Webhook(webhookSecret);
  const body = await req.text();
  try {
    const event = webhook.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as Event;

    if (event.type !== "user.created") {
      return NextResponse.json({ error: "Ignore event" }, { status: 400 });
    }

    const { email_addresses, first_name, last_name, id } = event.data;

    await prisma.user.create({
      data: {
        email: email_addresses[0].email_address,
        name: `${first_name} ${last_name}`,
        clerkId: id,
      },
    });
    return NextResponse.json({ message: "Seccess" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 500 });
  }
}
