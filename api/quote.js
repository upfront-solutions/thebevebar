// Vercel serverless function: POST /api/quote
// Emails the customer their estimate and sends the full request to The BeveBar.
// Set these in Vercel > Project > Settings > Environment Variables:
//   RESEND_API_KEY  (required)  your Resend API key
//   RESEND_FROM     (optional)  e.g. "The BeveBar <quotes@thebevebar.com>" once thebevebar.com is verified in Resend
//   NOTIFY_EMAIL    (optional)  where new requests go, defaults to thebevebar@gmail.com
// The email designs live in api/_emails.js.

const { customerEmail, teamEmail, money } = require("./_emails");

const NOTIFY = process.env.NOTIFY_EMAIL || "thebevebar@gmail.com";
const FROM = process.env.RESEND_FROM || "The BeveBar <onboarding@resend.dev>";

async function send(key, payload) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(500).json({ error: "Email is not set up yet (RESEND_API_KEY missing)." });

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  const d = body.lead || {};
  if (!d.email || !d.name) return res.status(400).json({ error: "Missing name or email" });
  if (body.website) return res.status(200).json({ ok: true }); // spam trap: real people never fill this hidden field
  const items = body.priceBreakdown || [];
  const total = body.total || 0;

  try {
    await send(key, {
      from: FROM, to: [d.email], reply_to: NOTIFY,
      subject: `Your BeveBar estimate: ${money(total)}`,
      html: customerEmail(d, items, total),
    });
    await send(key, {
      from: FROM, to: [NOTIFY], reply_to: d.email,
      subject: `New quote: ${d.name}, ${d.eventType}, ${d.eventDate}, ${money(total)}`,
      html: teamEmail(d, items, total),
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: "Could not send email" });
  }
};
