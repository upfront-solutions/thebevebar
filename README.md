# The BeveBar website

Plain HTML, CSS and JavaScript. No build step.

## Pages
- `index.html` home (with the booking form under "Who we serve")
- `quote.html` Book Us page (same booking form)
- `menu.html`, `locations.html`, `setup.html`, `partners.html`

`api/quote.js` is the only server code. Vercel runs it automatically to email quotes.

## Deploy on Vercel
1. Delete the old files in your GitHub repo, then upload everything in this folder to the top level.
2. Vercel > Settings > Build & Deployment > Framework Preset: **Other**. Leave Build Command and Output Directory empty.
3. Vercel > Settings > Environment Variables: add `RESEND_API_KEY`.
4. Deployments > latest > Redeploy.

## Google Sheet (lead capture)
Every person who fills in their contact info lands in the sheet as soon as they click
"See my estimate", even if they never click "Send my quote". One row per person; the
Status column updates to "Quote sent" if they send it.
1. Open `google-sheet/Code.gs` and follow the 5 steps at the top.
2. Paste the Web app URL into `js/config.js` (`sheetUrl: '...'`) and upload that file to GitHub.

## Email (Resend)
Resend can't send *from* a Gmail address. Until thebevebar.com is verified in Resend,
emails send from `onboarding@resend.dev`, and Resend only delivers those to your own Resend account email.
Once the domain is verified, add `RESEND_FROM` = `The BeveBar <quotes@thebevebar.com>` (any address @thebevebar.com).
Replies always go to thebevebar@gmail.com.

## Address lookup
The venue field suggests real addresses using OpenStreetMap (free, no account needed) and
estimates driving miles from Anaheim. If that service is ever down, it falls back to the
140 cities on the Locations page.
