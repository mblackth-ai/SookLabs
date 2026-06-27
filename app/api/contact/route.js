import { Resend } from "resend";
import { getContactConfig, isContactConfigured } from "../../../lib/contact-config";

function json(body, status = 200) {
  return Response.json(body, { status });
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request) {
  if (!isContactConfigured()) {
    return json(
      {
        error:
          "Contact delivery is not configured yet. Email sooklabs.th@gmail.com directly.",
      },
      503
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const name = clean(payload.name);
  const email = clean(payload.email);
  const website = clean(payload.website);
  const context = clean(payload.context);
  const subject = clean(payload.subject) || "SookLabs website inquiry";
  const formType = clean(payload.formType) || "contact";

  if (!name || !email) {
    return json({ error: "Name and email are required." }, 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Please enter a valid email address." }, 400);
  }

  const { resendApiKey, toEmail, fromEmail } = getContactConfig();
  const resend = new Resend(resendApiKey);

  const lines = [
    `Form: ${formType}`,
    `Name: ${name}`,
    `Email: ${email}`,
  ];
  if (website) lines.push(`Website: ${website}`);
  if (context) lines.push("", "Message:", context);

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject: `[SookLabs] ${subject}`,
      text: lines.join("\n"),
    });

    if (error) {
      console.error("Resend error:", error);
      return json(
        {
          error:
            "We could not send your message right now. Try sooklabs.th@gmail.com directly.",
        },
        502
      );
    }

    return json({ ok: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return json(
      {
        error:
          "Something went wrong. Email sooklabs.th@gmail.com and we will respond.",
      },
      500
    );
  }
}
