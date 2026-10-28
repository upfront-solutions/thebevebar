import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, eventDate, duration, serviceType, eventType,
            guestCount, venue, eventSpace, cupSize, packageChoice, customCupCount,
            baristaHours, extraHours, kegSwaps, parteaJugs, parteaBundles,
            customizations, estimatedMiles, howHeard, additionalInfo,
            priceBreakdown, total } = body;

    // Build email HTML
    const breakdownRows = priceBreakdown
      .map((item: { label: string; amount: number }) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;color:#555;">${item.label}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-weight:600;">
            ${item.amount > 0 ? `$${item.amount.toLocaleString()}` : "TBD"}
          </td>
        </tr>`
      )
      .join("");

    const customerEmail = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family:'Open Sans',Arial,sans-serif;background:#ece5dd;padding:40px 20px;">
        <div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;">
          <div style="background:#1a1a1a;padding:32px;text-align:center;">
            <h1 style="font-family:Georgia,serif;color:#ece5dd;margin:0;font-size:24px;font-weight:400;">
              The BeveBar
            </h1>
            <p style="color:#ece5dd99;font-size:12px;letter-spacing:3px;margin-top:8px;text-transform:uppercase;">
              Your Quote Estimate
            </p>
          </div>

          <div style="padding:32px;">
            <p style="color:#333;font-size:16px;margin-bottom:24px;">
              Hi ${name},
            </p>
            <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:24px;">
              Thank you for your interest in The BeveBar! Here is your estimated price breakdown
              for your upcoming ${eventType.toLowerCase()}.
            </p>

            <div style="background:#f9f6f2;border-radius:12px;padding:24px;margin-bottom:24px;">
              <h3 style="font-family:Georgia,serif;font-size:16px;margin:0 0 12px;">Event Details</h3>
              <p style="font-size:13px;color:#666;margin:4px 0;">Date: ${eventDate}</p>
              <p style="font-size:13px;color:#666;margin:4px 0;">Time: ${duration}</p>
              <p style="font-size:13px;color:#666;margin:4px 0;">Venue: ${venue}</p>
              <p style="font-size:13px;color:#666;margin:4px 0;">Guests: ~${guestCount}</p>
              <p style="font-size:13px;color:#666;margin:4px 0;">Service: ${serviceType}</p>
              <p style="font-size:13px;color:#666;margin:4px 0;">Space: ${eventSpace}</p>
            </div>

            <h3 style="font-family:Georgia,serif;font-size:16px;margin:0 0 16px;">Price Breakdown</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              ${breakdownRows}
              <tr>
                <td style="padding:16px 0 0;font-family:Georgia,serif;font-size:20px;font-weight:600;">
                  Estimated Total
                </td>
                <td style="padding:16px 0 0;text-align:right;font-family:Georgia,serif;font-size:24px;font-weight:600;">
                  $${total.toLocaleString()}
                </td>
              </tr>
            </table>

            <p style="font-size:11px;color:#999;margin-top:16px;line-height:1.5;">
              *This is an estimate. Final pricing may vary based on specific event requirements.
              A 50% deposit is required to secure your booking. Cancellations made 7+ days in advance
              receive a full refund.
            </p>

            <div style="margin-top:32px;padding-top:24px;border-top:1px solid #eee;">
              <p style="font-size:14px;color:#333;font-weight:600;margin-bottom:8px;">
                What happens next?
              </p>
              <p style="font-size:13px;color:#555;line-height:1.6;">
                Our team will contact you within 24-48 hours to confirm all the details and finalize
                your booking. In the meantime, feel free to reach out!
              </p>
            </div>

            <div style="margin-top:24px;text-align:center;">
              <a href="https://instagram.com/thebevebar"
                 style="font-size:12px;color:#999;text-decoration:none;">
                @thebevebar
              </a>
              <span style="color:#ddd;margin:0 8px;">|</span>
              <a href="mailto:thebevebar@gmail.com"
                 style="font-size:12px;color:#999;text-decoration:none;">
                thebevebar@gmail.com
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to customer via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      // Customer email
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "The BeveBar <thebevebar@gmail.com>",
          to: [email],
          subject: `Your BeveBar Quote - $${total.toLocaleString()}`,
          html: customerEmail,
        }),
      });

      // Notification to business
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "BeveBar Quotes <thebevebar@gmail.com>",
          to: ["thebevebar@gmail.com"],
          subject: `New Quote Request - ${name} - ${eventType} - $${total.toLocaleString()}`,
          html: `
            <h2>New Quote Request</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Event:</strong> ${eventType} on ${eventDate}</p>
            <p><strong>Time:</strong> ${duration}</p>
            <p><strong>Venue:</strong> ${venue} (${eventSpace})</p>
            <p><strong>Guests:</strong> ~${guestCount}</p>
            <p><strong>Service:</strong> ${serviceType}</p>
            <p><strong>Cup Size:</strong> ${cupSize}</p>
            <p><strong>Package:</strong> ${packageChoice}</p>
            ${packageChoice === "custom" ? `<p><strong>Custom Cups:</strong> ${customCupCount}</p>` : ""}
            <p><strong>Barista Hours:</strong> ${baristaHours}</p>
            <p><strong>Extra Hours:</strong> ${extraHours}</p>
            <p><strong>Keg Swaps:</strong> ${kegSwaps}</p>
            <p><strong>ParTea Jugs:</strong> ${parteaJugs}</p>
            <p><strong>Add On Bundles:</strong> ${parteaBundles}</p>
            <p><strong>Customizations:</strong> ${customizations.join(", ") || "None"}</p>
            <p><strong>Miles from Anaheim:</strong> ${estimatedMiles || "Not specified"}</p>
            <p><strong>How Heard:</strong> ${howHeard}</p>
            <p><strong>Additional Info:</strong> ${additionalInfo || "None"}</p>
            <hr/>
            <h3>Estimated Total: $${total.toLocaleString()}</h3>
            ${breakdownRows}
          `,
        }),
      });
    }

    // TODO: Append to Google Sheet when sheet ID is provided

    return NextResponse.json({ success: true, total });
  } catch (error) {
    console.error("Quote API error:", error);
    return NextResponse.json(
      { error: "Failed to process quote" },
      { status: 500 }
    );
  }
}
