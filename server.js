import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

/* ---------------------------------------------------------------
   Mail transport
   Set these in Railway under Variables:
     SMTP_HOST  (default: smtp-mail.outlook.com)
     SMTP_PORT  (default: 587)
     SMTP_USER  chromevaultstudios@outlook.dk
     SMTP_PASS  app password
     MAIL_TO    chromevaultstudios@outlook.dk
   If SMTP_USER/PASS are missing the inquiry is logged instead of sent,
   so local development works without credentials.
---------------------------------------------------------------- */
const hasMailConfig = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = hasMailConfig
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp-mail.outlook.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  : null;

const clean = (value, max = 2000) =>
  String(value ?? "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, max);

const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[char]
  );

// Simple rate limit: 5 inquiries per IP per 15 minutes
const hits = new Map();
const rateLimit = (req, res, next) => {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;
  const now = Date.now();
  const window = 15 * 60 * 1000;
  const record = hits.get(ip)?.filter((t) => now - t < window) || [];

  if (record.length >= 5) {
    return res
      .status(429)
      .json({ ok: false, error: "For mange forespørgsler. Prøv igen om lidt." });
  }

  record.push(now);
  hits.set(ip, record);
  next();
};

app.post("/api/inquiry", rateLimit, async (req, res) => {
  const name = clean(req.body.name, 120);
  const email = clean(req.body.email, 160);
  const profile = clean(req.body.profile, 60);
  const packageChoice = clean(req.body.package, 60);
  const timing = clean(req.body.timing, 120);
  const message = clean(req.body.message, 3000);
  const honeypot = clean(req.body.company, 100); // bots fill this, humans never see it

  if (honeypot) return res.json({ ok: true }); // silently drop bots

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ ok: false, error: "Udfyld navn, email og besked." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: "Tjek din emailadresse." });
  }

  const rows = [
    ["Navn", name],
    ["Email", email],
    ["Type", profile || "Ikke angivet"],
    ["Interesse", packageChoice || "Ikke angivet"],
    ["Tidspunkt / dato", timing || "Ikke angivet"]
  ];

  const html = `
    <div style="font-family:Helvetica,Arial,sans-serif;background:#0A0A0A;color:#fff;padding:32px">
      <p style="font-size:11px;letter-spacing:3px;color:#8E8E93;margin:0 0 6px">NY FORESPØRGSEL</p>
      <h2 style="margin:0 0 24px;letter-spacing:2px">CHROME VAULT STUDIOS</h2>
      <table style="width:100%;border-collapse:collapse">
        ${rows
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding:8px 0;color:#8E8E93;font-size:13px;width:150px">${label}</td>
            <td style="padding:8px 0;font-size:14px">${escapeHtml(value)}</td>
          </tr>`
          )
          .join("")}
      </table>
      <p style="color:#8E8E93;font-size:13px;margin:24px 0 8px">Besked</p>
      <p style="font-size:14px;line-height:1.7;white-space:pre-wrap;margin:0">${escapeHtml(
        message
      )}</p>
    </div>`;

  const text = [
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Besked:",
    message
  ].join("\n");

  if (!transporter) {
    console.log("--- FORESPØRGSEL (ingen SMTP konfigureret) ---\n" + text);
    return res.json({ ok: true });
  }

  try {
    await transporter.sendMail({
      from: `"Chrome Vault Studios" <${process.env.SMTP_USER}>`,
      to: process.env.MAIL_TO || process.env.SMTP_USER,
      replyTo: email,
      subject: `Forespørgsel: ${name} (${profile || "ikke angivet"})`,
      text,
      html
    });
    res.json({ ok: true });
  } catch (error) {
    console.error("Mail failed:", error.message);
    res.status(500).json({
      ok: false,
      error: "Beskeden kunne ikke sendes. Skriv til chromevaultstudios@outlook.dk."
    });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Chrome Vault Studios running on port ${PORT}`);
  if (!hasMailConfig) {
    console.log("No SMTP config found. Inquiries will be logged to console.");
  }
});
