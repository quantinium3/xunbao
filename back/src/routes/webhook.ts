import { Hono } from "hono"
import { Webhook } from "svix";
import { db } from "../lib/db";
import { UserDeletedJSON, UserJSON, WebhookEvent } from "@clerk/backend";
import { user } from "../lib/db/schema/auth-schema";
import { eq } from "drizzle-orm";

const webhookRouter = new Hono()

webhookRouter.post("/", async (c) => {
  const payload = await c.req.text();

  const svix_id = c.req.header('svix-id');
  const svix_timestamp = c.req.header('svix-timestamp');
  const svix_signature = c.req.header('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return c.json({ error: 'Missing headers' }, 400);
  }

  const headers = {
    'svix-id': svix_id,
    'svix-timestamp': svix_timestamp,
    'svix-signature': svix_signature
  };

  try {
    const webhook_secret = process.env.CLERK_WEBHOOK_SECRET!
    if (!webhook_secret) {
      console.error("no clerk webhook secret present")
    }
    const wh = new Webhook(webhook_secret)
    const evt = wh.verify(payload, headers) as WebhookEvent

    await handleClerkWebhook(evt)
    return c.json({ success: true })
  } catch (err) {
    console.error('Webhook error: ', err)
    return c.json({
      error: err
    }, 400)
  }

})

async function handleUserCreated(data: UserJSON) {
  try {
    if (!data.unsafe_metadata.rollNumber || !data.unsafe_metadata.university || !data.unsafe_metadata.phoneNumber || !data.unsafe_metadata.branch) {
      throw new Error("Missing required user metadata from Clerk");
    }
    await db.insert(user).values({
      id: data.id,
      name: data.username!,
      email: data.email_addresses[0].email_address,
      roll_number: data.unsafe_metadata.rollNumber as string,
      university: data.unsafe_metadata.university as string,
      phone_number: data.unsafe_metadata.phoneNumber as string,
      branch: data.unsafe_metadata.branch as string
    })
      .onConflictDoUpdate({
        target: user.id,
        set: {
          name: data.username!,
          email: data.email_addresses[0].email_address,
          roll_number: data.unsafe_metadata.rollNumber as string,
          university: data.unsafe_metadata.university as string,
          phone_number: data.unsafe_metadata.phoneNumber as string,
          branch: data.unsafe_metadata.branch as string
        }
      })
  } catch (err) {
    throw new Error(`Failed to create user in database: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function handleUserDeleted(data: UserDeletedJSON) {
  try {
    await db.delete(user).where(eq(user.id, data.id!));
  } catch (err) {
    throw new Error(`Failed to delete user in database: ${err instanceof Error ? err.message : String(err)}`)
  }
}


async function handleClerkWebhook(evt: WebhookEvent) {
  switch (evt.type) {
    case 'user.created':
      await handleUserCreated(evt.data);
      break;
    case 'user.deleted':
      await handleUserDeleted(evt.data);
      break;
    default:
      console.log(`Unhandled event: ${evt.type}`);
  }
}

export default webhookRouter;


