// Vercel function: emails website form submissions (appointment requests, contact messages) to the office through Resend.
//
// Environment variables (set in the Vercel project):
//   RESEND_API_KEY  required
//   FORM_TO         inbox(es) that receive submissions, comma-separated
//   FORM_FROM       sender, e.g. "A Miracle Smile <website@your-domain.com>" once the domain is verified in Resend.
//                   Until then Resend's test sender is used, which only delivers to the Resend account's own email.
//
// Privacy: the forms ask visitors not to send medical history. Keep it that way. Plain email is not a
// HIPAA-compliant channel for health information, so don't add fields that collect it.

const TEST_SENDER = "A Miracle Smile website <onboarding@resend.dev>";
const SKIP = new Set(["form", "website"]);

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const label = (k) => k.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body || {};
  if (typeof body === "string") {
    try { body = JSON.parse(body || "{}"); } catch { return res.status(400).json({ error: "Invalid request." }); }
  }

  // Bots fill in the hidden "website" field; real visitors never see it
  if (body.website) return res.status(200).json({ ok: true });

  const email = String(body.email || "").trim();
  const name = [body.first_name, body.last_name].filter(Boolean).join(" ").trim();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Please include your name and a valid email." });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.FORM_TO;
  if (!key || !to) {
    console.error("Form email is not configured: set RESEND_API_KEY and FORM_TO");
    return res.status(500).json({ error: "Form email is not configured." });
  }

  const kind = String(body.form || "Website message").slice(0, 60);
  const rows = Object.entries(body)
    .filter(([k, v]) => !SKIP.has(k) && String(v).trim())
    .map(([k, v]) => [label(k), String(v).slice(0, 4000)]);
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<h2 style="font-family:Arial,sans-serif;color:#0f2729">${esc(kind)}</h2>
<table style="font-family:Arial,sans-serif;font-size:15px;border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#4f5f5d;vertical-align:top">${esc(k)}</td><td style="padding:6px 0;white-space:pre-wrap">${esc(v)}</td></tr>`)
    .join("")}</table>
<p style="font-family:Arial,sans-serif;color:#4f5f5d;font-size:13px">Reply to this email to answer ${esc(name)} directly.</p>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.FORM_FROM || TEST_SENDER,
      to: to.split(",").map((s) => s.trim()).filter(Boolean),
      reply_to: email,
      subject: `${kind}: ${name}`,
      text,
      html,
    }),
  });
  if (!response.ok) {
    console.error("Resend failed", response.status, await response.text());
    return res.status(502).json({ error: "We couldn't send that right now." });
  }
  return res.status(200).json({ ok: true });
};
