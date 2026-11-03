// Email templates for quote requests.
//   customerEmail(): the estimate the customer receives
//   teamEmail():     the new-lead notice The BeveBar receives
// Files in /api that start with "_" are not public URLs on Vercel; this one is only used by api/quote.js.
// Emails are built with tables and inline styles because that is what email apps (Gmail, Outlook, Apple Mail) support.

const SITE = "https://thebevebar.com";
const EMAIL = "thebevebar@gmail.com";
const IG = "https://instagram.com/thebevebar";

const C = { cream: "#ece5dd", creamLight: "#f6f2ed", ink: "#1a1a1a", text: "#333333", muted: "#7a736c", line: "#e4ddd4" };
const SERIF = "Baskerville, 'Libre Baskerville', Georgia, 'Times New Roman', serif";
const SANS = "'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => "$" + Number(n || 0).toLocaleString("en-US");

function prettyDate(iso) {
  if (!iso) return "";
  const [y, m, d] = String(iso).split("-").map(Number);
  if (!y || !m || !d) return esc(iso);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function shell(preheader, inner) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only"><title>The BeveBar</title></head>
<body style="margin:0;padding:0;background:${C.cream};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;">
${inner}
</table>
<p style="margin:18px 0 0;font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.muted};">
Serving Orange County, Los Angeles, San Diego, &amp; surrounding areas</p>
</td></tr></table></body></html>`;
}

function header() {
  return `<tr><td align="center" style="padding:34px 32px 26px;border-bottom:1px solid ${C.line};">
  <a href="${SITE}" style="text-decoration:none;"><img src="${SITE}/images/logo-nav.png" width="220" alt="The BeveBar" style="display:block;width:220px;max-width:70%;height:auto;border:0;"></a>
</td></tr>`;
}

function detailRows(rows) {
  return rows.filter(([, v]) => v !== "" && v != null).map(([k, v]) =>
    `<tr><td style="padding:5px 12px 5px 0;font-family:${SANS};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};white-space:nowrap;vertical-align:top;">${k}</td>
     <td style="padding:5px 0;font-family:${SANS};font-size:14px;color:${C.text};">${v}</td></tr>`).join("");
}

function breakdown(items, total) {
  const rows = (items || []).map((i) =>
    `<tr><td style="padding:9px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:14px;color:${C.text};">${esc(i.label)}</td>
     <td align="right" style="padding:9px 0 9px 16px;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:14px;color:${C.ink};white-space:nowrap;">${i.amount == null ? "TBD" : money(i.amount)}</td></tr>`).join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}
  <tr><td style="padding:18px 0 0;font-family:${SERIF};font-size:19px;color:${C.ink};">Estimated total*</td>
  <td align="right" style="padding:18px 0 0;font-family:${SERIF};font-size:28px;color:${C.ink};white-space:nowrap;">${money(total)}</td></tr></table>`;
}

function button(href, label, solid) {
  const bg = solid ? C.ink : "#ffffff", fg = solid ? "#ffffff" : C.ink;
  return `<a href="${href}" style="display:inline-block;margin:4px 4px;padding:11px 26px;border:1px solid ${C.ink};border-radius:999px;background:${bg};color:${fg};font-family:${SANS};font-size:12px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;">${label}</a>`;
}

function eventRows(d) {
  const time = d.startTime && d.endTime ? `${esc(d.startTime)} to ${esc(d.endTime)}` : "";
  const drinks = [d.package === "Custom" && d.customCups ? `Custom, ${esc(d.customCups)} cups` : esc(d.package), esc(d.cupSize)].filter(Boolean).join(" · ");
  return [
    ["Event", esc(d.eventType)],
    ["Date", prettyDate(d.eventDate)],
    ["Time", time],
    ["Guests", d.guests ? `~${esc(d.guests)}` : ""],
    ["Venue", esc(d.address)],
    ["Service", esc(d.serviceType)],
    ["Drinks", drinks],
  ];
}

/* ---------- The estimate the customer receives ---------- */
function customerEmail(d, items, total) {
  const first = esc(String(d.name || "").trim().split(/\s+/)[0] || "there");
  const inner = `${header()}
<tr><td style="padding:34px 32px 6px;">
  <p style="margin:0;font-family:${SERIF};font-style:italic;font-size:22px;color:${C.ink};">Hi ${first},</p>
  <p style="margin:14px 0 0;font-family:${SANS};font-size:15px;line-height:1.65;color:${C.text};">
  Thanks for reaching out! Here is your estimate for your ${esc(String(d.eventType || "event").toLowerCase())}.
  Our team will contact you to confirm!</p>
</td></tr>
<tr><td style="padding:24px 32px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.creamLight};">
  <tr><td style="padding:18px 20px;"><table role="presentation" cellpadding="0" cellspacing="0">${detailRows(eventRows(d))}</table></td></tr></table>
</td></tr>
<tr><td style="padding:28px 32px 0;">
  <p style="margin:0 0 6px;font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.muted};">Your estimate</p>
  ${breakdown(items, total)}
  <p style="margin:16px 0 0;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.muted};">
  *This is an estimate. Final pricing is confirmed by our team. A 50% deposit is required to secure your booking.
  Cancellations made 7 days prior to the event receive a full refund.</p>
</td></tr>
<tr><td align="center" style="padding:30px 32px 8px;">
  ${button(`mailto:${EMAIL}?subject=${encodeURIComponent("My BeveBar quote")}`, "Reply to book", true)}
  ${button(`${SITE}/menu`, "View menu", false)}
</td></tr>
<tr><td align="center" style="padding:22px 32px 34px;">
  <p style="margin:0;font-family:${SERIF};font-style:italic;font-size:15px;color:${C.text};">Questions? Just reply to this email.</p>
  <p style="margin:12px 0 0;font-family:${SANS};font-size:12px;letter-spacing:1px;color:${C.muted};">
  <a href="${IG}" style="color:${C.muted};text-decoration:none;">@thebevebar</a> &nbsp;·&nbsp;
  <a href="mailto:${EMAIL}" style="color:${C.muted};text-decoration:none;">${EMAIL}</a></p>
</td></tr>`;
  return shell(`Your BeveBar estimate: ${money(total)}`, inner);
}

/* ---------- The new-lead notice The BeveBar receives ---------- */
function teamEmail(d, items, total) {
  const phoneDigits = String(d.phone || "").replace(/[^\d+]/g, "");
  const contact = [
    ["Name", esc(d.name)],
    ["Phone", d.phone ? `<a href="tel:${phoneDigits}" style="color:${C.ink};">${esc(d.phone)}</a>` : ""],
    ["Email", d.email ? `<a href="mailto:${esc(d.email)}" style="color:${C.ink};">${esc(d.email)}</a>` : ""],
    ["Heard via", esc(d.howHeard)],
  ];
  const extras = [
    ["Miles", d.milesFromAnaheim !== "" && d.milesFromAnaheim != null ? `~${esc(d.milesFromAnaheim)} from Anaheim` : "Not estimated"],
    ["Space", esc(d.eventSpace)],
    ["Hours", esc(d.hours)],
    ["Baristas", esc(d.baristas)],
    ["Keg swaps", esc(d.kegSwaps)],
    ["ParTea Jugs", esc(d.partea_jugs)],
    ["Add On Bundles", esc(d.addon_bundles)],
    ["Customize", esc(d.customizations)],
    ["Notes", esc(d.notes)],
  ];
  const inner = `<tr><td style="padding:26px 32px 18px;border-bottom:1px solid ${C.line};">
  <p style="margin:0;font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.muted};">New quote request</p>
  <p style="margin:6px 0 0;font-family:${SERIF};font-size:24px;color:${C.ink};">${esc(d.name)} · ${money(total)}</p>
  <p style="margin:6px 0 0;font-family:${SANS};font-size:14px;color:${C.text};">${esc(d.eventType)} · ${prettyDate(d.eventDate)} · ~${esc(d.guests)} guests</p>
</td></tr>
<tr><td style="padding:22px 32px 0;"><table role="presentation" cellpadding="0" cellspacing="0">${detailRows(contact)}</table></td></tr>
<tr><td style="padding:18px 32px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.creamLight};">
  <tr><td style="padding:16px 20px;"><table role="presentation" cellpadding="0" cellspacing="0">${detailRows(eventRows(d).concat(extras))}</table></td></tr></table></td></tr>
<tr><td style="padding:24px 32px 30px;">${breakdown(items, total)}
  <p style="margin:16px 0 0;font-family:${SANS};font-size:12px;color:${C.muted};">The customer was sent this same estimate. Reply to this email to reach them directly.</p>
</td></tr>`;
  return shell(`${d.name} · ${d.eventType} · ${money(total)}`, inner);
}

module.exports = { customerEmail, teamEmail, money };
