import nodemailer from 'nodemailer';

let transporterPromise = null;

export const ADMIN_ALERT_EMAIL = process.env.ADMIN_ALERT_EMAIL || 'hannanbrice1@gmail.com';

/**
 * Creates or retrieves the email transporter.
 * If custom SMTP environment variables (SMTP_HOST, SMTP_USER, SMTP_PASS) are provided,
 * it uses your domain's live mail server. Otherwise, it falls back to Ethereal test accounts.
 */
async function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = (async () => {
      // 1. Live Custom Domain SMTP (IONOS, Porkbun, Google Workspace, PrivateEmail, SendGrid, etc.)
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        console.log(`[Email System] Connecting to live SMTP server: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587}`);
        return nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      }

      // 2. Fallback: Ethereal test account for development and pre-domain testing
      try {
        const testAccount = await nodemailer.createTestAccount();
        console.log(`[Email System] Ethereal test inbox active (${testAccount.user})`);
        return nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      } catch (e) {
        console.log('[Email System] Test account offline; falling back to console logger');
        return null;
      }
    })();
  }
  return transporterPromise;
}

export const APP_URL = process.env.APP_URL || 'https://danandshaytour.online';
const FROM_HEADER = process.env.SMTP_FROM || '"Dan + Shay Official" <orders@danandshaytour.online>';

// Global Luxury Styling for all Dan + Shay HTML Emails
const baseStyles = `
  body { margin: 0; padding: 0; background-color: #F8F5F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E1E2F; -webkit-font-smoothing: antialiased; }
  table { border-collapse: collapse; width: 100%; }
  .email-wrapper { width: 100%; background-color: #F8F5F0; padding: 30px 10px; }
  .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.08); border: 1px solid #EAE5DC; }
  .header { background: linear-gradient(135deg, #121124 0%, #1D1C36 100%); color: #FFFFFF; padding: 32px 24px; text-align: center; border-bottom: 3px solid #C9A84C; }
  .brand-title { color: #C9A84C; font-size: 24px; font-weight: 900; letter-spacing: 2px; margin: 0; text-transform: uppercase; }
  .brand-subtitle { color: #D1D5DB; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; margin-top: 6px; text-transform: uppercase; }
  .content { padding: 32px 28px; }
  .section-title { font-size: 20px; font-weight: 800; color: #121124; margin: 0 0 8px 0; }
  .card-box { background: #FAF7F2; border: 1px solid #E8DFD3; border-radius: 8px; padding: 20px; margin: 20px 0; }
  .receipt-table th { text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; color: #6B7280; font-weight: 700; border-bottom: 2px solid #E5E7EB; }
  .receipt-table td { padding: 12px 10px; font-size: 13px; color: #1F2937; border-bottom: 1px solid #F3F4F6; }
  .total-row td { font-weight: 800; font-size: 16px; color: #121124; border-top: 2px solid #C9A84C; border-bottom: none; padding-top: 14px; }
  .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
  .badge-success { background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }
  .badge-pending { background: #FFFBEB; color: #B45309; border: 1px solid #FDE68A; }
  .btn-gold { display: inline-block; background: #C9A84C; color: #121124 !important; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 6px; text-transform: uppercase; letter-spacing: 1px; }
  .footer { background: #121124; color: #9CA3AF; text-align: center; padding: 24px 20px; font-size: 11px; line-height: 1.6; border-top: 1px solid #2B2B44; }
  .footer a { color: #C9A84C; text-decoration: none; font-weight: bold; }
`;

// Helper: mask gift card digits for customer security
function maskCardCode(code) {
  if (!code) return 'N/A';
  return code.split('\n').map(line => {
    const parts = line.split(': ');
    if (parts.length === 2) {
      const val = parts[1].trim();
      const masked = val.length > 8 ? val.slice(0, 4) + ' ****-**** ' + val.slice(-4) : '****';
      return parts[0] + ': ' + masked;
    }
    return line.length > 8 ? line.slice(0, 4) + ' ****-**** ' + line.slice(-4) : '****';
  }).join('\n');
}

/**
 * 1. OFFICIAL TICKET CONFIRMATION & DIGITAL PASS EMAIL
 */
export function sendTicketConfirmation(userEmail, userName, order, tickets = [], event = {}) {
  setImmediate(async () => {
    try {
      const t = await getTransporter();
      const orderId = order?.id || 'DS-1001';
      const orderTotal = typeof order?.total === 'number' ? order.total.toFixed(2) : order?.total || '0.00';
      const eventTitle = event?.title || 'Dan + Shay: The Young Tour 2026';
      const eventDate = event?.date || '2026 Tour Season';
      const eventVenue = `${event?.venue || 'Concert Arena'}, ${event?.city || 'Nashville'}, ${event?.state || 'TN'}`;
      
      const seatsList = (tickets || []).map(s => `Sec ${s.section}, Row ${s.row}, Seat ${s.seat_number || s.seatNumber}`).join(' | ') || 'Reserved Seating';
      const primarySeat = tickets[0] || {};
      const qrPayload = encodeURIComponent(`${APP_URL}/verify-ticket?order=${orderId}&seat=${primarySeat.seat_number || 1}&token=DS26-${orderId}-VERIFIED`);
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qrPayload}&margin=6`;

      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><style>${baseStyles}</style></head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <div class="brand-title">DAN + SHAY</div>
                <div class="brand-subtitle">The Young Tour 2026 • Official Entry Pass</div>
              </div>

              <div class="content">
                <div style="text-align: center; margin-bottom: 24px;">
                  <span class="badge badge-success">✓ Verified Valid Entry Pass</span>
                  <h1 class="section-title" style="margin-top: 12px; font-size: 24px;">You're Going to the Show! 🎶</h1>
                  <p style="color: #4B5563; font-size: 14px; margin: 4px 0 0 0;">Hi ${userName}, your tickets for Dan + Shay live are confirmed.</p>
                </div>

                <!-- Event Details Card -->
                <div class="card-box" style="border-left: 4px solid #C9A84C;">
                  <div style="font-size: 11px; font-weight: 800; color: #C9A84C; text-transform: uppercase; letter-spacing: 1px;">Concert Schedule</div>
                  <div style="font-size: 18px; font-weight: 800; color: #121124; margin-top: 4px;">${eventTitle}</div>
                  <div style="font-size: 14px; color: #374151; margin-top: 6px;">
                    <strong>Date & Time:</strong> ${eventDate} • Doors 6:00 PM / Show 7:30 PM
                  </div>
                  <div style="font-size: 14px; color: #374151; margin-top: 4px;">
                    <strong>Venue:</strong> ${eventVenue}
                  </div>
                </div>

                <!-- Seating & Digital Turnstile Pass -->
                <div style="background: #FFFFFF; border: 2px dashed #C9A84C; border-radius: 10px; padding: 24px; text-align: center; margin: 24px 0;">
                  <div style="font-size: 11px; font-weight: 800; color: #6B7280; text-transform: uppercase; letter-spacing: 1px;">Official Digital Turnstile Pass</div>
                  
                  <div style="margin: 16px 0;">
                    <img src="${qrImageUrl}" width="160" height="160" alt="Ticket QR Code" style="display: inline-block; border-radius: 8px; border: 1px solid #E5E7EB;" />
                  </div>

                  <div style="font-size: 16px; font-weight: 900; color: #121124; font-family: monospace;">
                    ${seatsList}
                  </div>
                  <div style="font-size: 11px; color: #6B7280; margin-top: 4px; font-family: monospace;">
                    ORDER #${orderId} • GATE A (EXPEDITED ENTRY)
                  </div>
                  <div style="font-size: 11px; color: #059669; font-weight: 700; margin-top: 6px;">
                    ★ Present this QR code or open your digital pass upon arrival at the gate ★
                  </div>
                </div>

                <!-- Itemized Receipt -->
                <div style="margin-top: 28px;">
                  <div style="font-size: 14px; font-weight: 800; color: #121124; margin-bottom: 8px;">Order Summary & Receipt</div>
                  <table class="receipt-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>${eventTitle}</strong><br><span style="font-size: 12px; color: #6B7280;">${seatsList}</span></td>
                        <td style="text-align: center;">${tickets.length || 1}</td>
                        <td style="text-align: right; font-weight: bold;">$${orderTotal}</td>
                      </tr>
                      <tr class="total-row">
                        <td colspan="2">Total Paid (Gift Card)</td>
                        <td style="text-align: right;">$${orderTotal}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Important Venue Rules -->
                <div style="background: #F3F4F6; border-radius: 8px; padding: 16px; font-size: 12px; color: #4B5563; margin-top: 24px; line-height: 1.5;">
                  <strong>Important Venue Information:</strong>
                  <ul style="margin: 6px 0 0 16px; padding: 0;">
                    <li>Please have government photo ID ready matching the purchaser name: <strong>${userName}</strong>.</li>
                    <li>Digital tickets are non-transferable and can be presented directly on your mobile device.</li>
                    <li>Clear bag policy is strictly enforced at all tour venues.</li>
                  </ul>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="${APP_URL}/my-tickets" class="btn-gold">View Your Digital Passes Online ➔</a>
                </div>
              </div>

              <div class="footer">
                <p>Dan + Shay • Official 2026 The Young Tour<br>Live Nation & Ticketmaster Certified Partner</p>
                <p>Need support? Contact us anytime at <a href="mailto:support@danandshaytour.online">support@danandshaytour.online</a></p>
                <p style="font-size: 10px; color: #6B7280;">Order #${orderId} • Confidential Ticket Pass</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      if (t) {
        const info = await t.sendMail({
          from: FROM_HEADER,
          to: userEmail,
          subject: `🎟️ Your Official Tickets: Dan + Shay The Young Tour (Order #${orderId})`,
          html,
        });
        console.log('[Ticket Email Sent] Dispatched to', userEmail, nodemailer.getTestMessageUrl(info) || '');
      } else {
        console.log(`[Ticket Email Logged] Dispatched to ${userEmail} for Order #${orderId}`);
      }
    } catch (err) {
      console.error('Ticket confirmation email error:', err.message);
    }
  });
}

/**
 * 2. VIP MEET & GREET ACCESS PASS CONFIRMATION
 */
export function sendMeetGreetConfirmation(userEmail, userName, order, packageInfo = {}, event = {}) {
  setImmediate(async () => {
    try {
      const t = await getTransporter();
      const orderId = order?.id || 'DS-MG-2001';
      const orderTotal = typeof order?.total === 'number' ? order.total.toFixed(2) : order?.total || '400.00';
      const pkgTitle = packageInfo?.title || 'VIP Meet & Greet Experience';
      const locCity = order?.location_city || event?.city || 'Nashville';
      const locState = order?.location_state || event?.state || 'Tennessee';
      const venue = event?.venue || 'Private VIP Artist Lounge';
      const perks = packageInfo?.perks || 'Private Meet & Greet with Dan + Shay, Photo Op, VIP Commemorative Laminate, Soundcheck Access';

      const qrPayload = encodeURIComponent(`${APP_URL}/verify-vip?order=${orderId}&token=DS26-VIP-${orderId}-CONFIRMED`);
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qrPayload}&margin=6`;

      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><style>${baseStyles}</style></head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <div class="brand-title">DAN + SHAY</div>
                <div class="brand-subtitle">VIP Backstage Pass • Official Access Credential</div>
              </div>

              <div class="content">
                <div style="text-align: center; margin-bottom: 24px;">
                  <span class="badge" style="background: #FEF3C7; color: #92400E; border: 1px solid #FCD34D;">★ Official VIP Backstage Access ★</span>
                  <h1 class="section-title" style="margin-top: 12px; font-size: 24px;">You're Going Backstage! ✨</h1>
                  <p style="color: #4B5563; font-size: 14px; margin: 4px 0 0 0;">Hi ${userName}, your exclusive VIP Meet & Greet credential is confirmed.</p>
                </div>

                <!-- VIP Package Overview Card -->
                <div class="card-box" style="border-left: 4px solid #C9A84C; background: #FFFDF9;">
                  <div style="font-size: 11px; font-weight: 800; color: #C9A84C; text-transform: uppercase; letter-spacing: 1px;">VIP Package Details</div>
                  <div style="font-size: 20px; font-weight: 800; color: #121124; margin-top: 4px;">${pkgTitle}</div>
                  <div style="font-size: 14px; color: #374151; margin-top: 6px;">
                    <strong>Location:</strong> ${locCity}, ${locState} • ${venue}
                  </div>
                  <div style="font-size: 14px; color: #B45309; font-weight: bold; margin-top: 6px;">
                    VIP Check-In Time: 4:30 PM SHARP (2 Hours Before General Doors)
                  </div>
                </div>

                <!-- VIP Perks List -->
                <div style="margin: 20px 0;">
                  <div style="font-size: 13px; font-weight: 800; color: #121124; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                    Your Included VIP Privileges:
                  </div>
                  <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 14px; font-size: 13px; color: #374151; line-height: 1.8;">
                    ${perks.split(',').map(p => `<div>★ <strong>${p.trim()}</strong></div>`).join('')}
                  </div>
                </div>

                <!-- Digital Check-In QR Credential -->
                <div style="background: #121124; color: #FFFFFF; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                  <div style="color: #C9A84C; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;">VIP Turnstile Credential</div>
                  
                  <div style="margin: 16px 0;">
                    <img src="${qrImageUrl}" width="160" height="160" alt="VIP Pass QR" style="display: inline-block; background: #FFFFFF; padding: 6px; border-radius: 8px;" />
                  </div>

                  <div style="color: #FDF8F0; font-size: 14px; font-weight: bold; font-family: monospace;">
                    CREDENTIAL: ${userName.toUpperCase()}
                  </div>
                  <div style="color: #C9A84C; font-size: 11px; font-family: monospace; margin-top: 4px;">
                    ORDER #${orderId} • EXPEDITED VIP CHECK-IN
                  </div>
                </div>

                <!-- Payment Receipt -->
                <table class="receipt-table">
                  <thead>
                    <tr><th>Item</th><th style="text-align: right;">Amount</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>${pkgTitle}</strong><br><span style="font-size: 12px; color: #6B7280;">VIP Experience Access Pass (${locCity}, ${locState})</span></td>
                      <td style="text-align: right; font-weight: bold;">$${orderTotal}</td>
                    </tr>
                    <tr class="total-row">
                      <td>Total Paid (Gift Card)</td>
                      <td style="text-align: right;">$${orderTotal}</td>
                    </tr>
                  </tbody>
                </table>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="${APP_URL}/my-tickets" class="btn-gold">View Your VIP Credential ➔</a>
                </div>
              </div>

              <div class="footer">
                <p>Dan + Shay • Official VIP Backstage Guest Program</p>
                <p>Questions about your VIP session? Reach out at <a href="mailto:vip@danandshaytour.online">vip@danandshaytour.online</a></p>
                <p style="font-size: 10px; color: #6B7280;">VIP Pass #${orderId} • Non-Transferable • Photo ID Required</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      if (t) {
        const info = await t.sendMail({
          from: FROM_HEADER,
          to: userEmail,
          subject: `✨ VIP Meet & Greet Pass Confirmed: Dan + Shay in ${locCity} (Order #${orderId})`,
          html,
        });
        console.log('[VIP Email Sent] Dispatched to', userEmail, nodemailer.getTestMessageUrl(info) || '');
      }
    } catch (err) {
      console.error('Meet & greet confirmation email error:', err.message);
    }
  });
}

/**
 * 3. VIP EXECUTIVE FAN CARD MEMBERSHIP CONFIRMATION
 */
export function sendFanCardConfirmation(userEmail, userName, order, card = {}) {
  setImmediate(async () => {
    try {
      const t = await getTransporter();
      const orderId = order?.id || 'DS-FC-3001';
      const orderTotal = typeof order?.total === 'number' ? order.total.toFixed(2) : order?.total || '150.00';
      const cardTitle = card?.title || 'Silver All-Access Pass';
      const cardRarity = card?.rarity || 'Silver';
      const cardDesc = card?.description || 'Authentic laser-etched metallic membership card. Lifetime Dan + Shay collector status.';
      const serialToken = `DS26-${cardRarity.toUpperCase()}-${String(orderId).padStart(4, '0')}-MEMBER`;

      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><style>${baseStyles}</style></head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <div class="brand-title">DAN + SHAY</div>
                <div class="brand-subtitle">Executive Founders Club • VIP Fan Membership</div>
              </div>

              <div class="content">
                <div style="text-align: center; margin-bottom: 24px;">
                  <span class="badge" style="background: #EEF2FF; color: #4338CA; border: 1px solid #C7D2FE;">★ Lifetime VIP Collector Pass ★</span>
                  <h1 class="section-title" style="margin-top: 12px; font-size: 24px;">Membership Pass Unlocked! 🎴</h1>
                  <p style="color: #4B5563; font-size: 14px; margin: 4px 0 0 0;">Welcome to the Dan + Shay Founders Club, ${userName}.</p>
                </div>

                <div class="card-box" style="border-left: 4px solid #C9A84C; background: #FAF5EE;">
                  <div style="font-size: 11px; font-weight: 800; color: #C9A84C; text-transform: uppercase; letter-spacing: 1px;">Pass Authenticated</div>
                  <div style="font-size: 20px; font-weight: 800; color: #121124; margin-top: 4px;">${cardTitle}</div>
                  <div style="font-size: 13px; color: #6B7280; margin-top: 4px;">Tier: <strong style="color: #C9A84C; text-transform: uppercase;">${cardRarity}</strong></div>
                  <div style="font-size: 13px; color: #374151; margin-top: 8px; line-height: 1.5;">${cardDesc}</div>
                  <div style="font-size: 11px; font-family: monospace; font-weight: bold; color: #121124; margin-top: 10px; background: #FFFFFF; padding: 6px 10px; border-radius: 4px; display: inline-block; border: 1px solid #E5E7EB;">
                    TOKEN: ${serialToken}
                  </div>
                </div>

                <!-- Itemized Receipt -->
                <table class="receipt-table">
                  <thead>
                    <tr><th>Membership Tier</th><th style="text-align: right;">Amount</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>${cardTitle}</strong><br><span style="font-size: 12px; color: #6B7280;">VIP Lifetime Collector Pass</span></td>
                      <td style="text-align: right; font-weight: bold;">$${orderTotal}</td>
                    </tr>
                    <tr class="total-row">
                      <td>Total Paid (Gift Card)</td>
                      <td style="text-align: right;">$${orderTotal}</td>
                    </tr>
                  </tbody>
                </table>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="${APP_URL}/fan-cards" class="btn-gold">View Your 3D Card in Digital Vault ➔</a>
                </div>
              </div>

              <div class="footer">
                <p>Dan + Shay • Founders Club Collector Program</p>
                <p>Support: <a href="mailto:cards@danandshaytour.online">cards@danandshaytour.online</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      if (t) {
        const info = await t.sendMail({
          from: FROM_HEADER,
          to: userEmail,
          subject: `🎴 VIP Membership Card Activated: ${cardTitle} (Order #${orderId})`,
          html,
        });
        console.log('[FanCard Email Sent] Dispatched to', userEmail, nodemailer.getTestMessageUrl(info) || '');
      }
    } catch (err) {
      console.error('Fan card confirmation email error:', err.message);
    }
  });
}

/**
 * 4. ORDER SUBMITTED / PAYMENT PROCESSING RECEIPT (IMMEDIATE)
 */
export function sendOrderSubmittedReceipt({ userEmail, userName, orderId, type, total, itemsDesc, giftCardProvider, giftCardCode }) {
  setImmediate(async () => {
    try {
      const t = await getTransporter();
      const orderTotal = typeof total === 'number' ? total.toFixed(2) : total || '0.00';
      const maskedCode = maskCardCode(giftCardCode);

      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><style>${baseStyles}</style></head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <div class="brand-title">DAN + SHAY</div>
                <div class="brand-subtitle">Official Order Confirmation & Payment Receipt</div>
              </div>

              <div class="content">
                <div style="text-align: center; margin-bottom: 24px;">
                  <span class="badge badge-pending">⏳ Payment Under Verification</span>
                  <h1 class="section-title" style="margin-top: 12px; font-size: 24px;">Thank You for Your Order! 🧾</h1>
                  <p style="color: #4B5563; font-size: 14px; margin: 4px 0 0 0;">Hi ${userName}, we have received your order <strong>#${orderId}</strong>.</p>
                </div>

                <!-- Verification Notice -->
                <div style="background: #FFFBEB; border: 1px solid #FCD34D; border-left: 4px solid #D97706; border-radius: 8px; padding: 16px; font-size: 13px; color: #92400E; margin-bottom: 24px; line-height: 1.5;">
                  <strong>Order Status: Reserved & Processing</strong>
                  <p style="margin: 6px 0 0 0;">
                    Your gift card payment has been submitted for manual verification. Our executive ticketing desk typically authenticates submissions within <strong>15–30 minutes</strong>. Your seats and credentials are held securely in your name.
                  </p>
                </div>

                <!-- Itemized Receipt -->
                <div style="margin: 20px 0;">
                  <div style="font-size: 14px; font-weight: 800; color: #121124; margin-bottom: 8px;">Order Details</div>
                  <table class="receipt-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th style="text-align: right;">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>${type}</strong><br><span style="font-size: 12px; color: #6B7280;">${itemsDesc || 'Dan + Shay 2026 Concert Reservation'}</span></td>
                        <td style="text-align: right; font-weight: bold;">$${orderTotal}</td>
                      </tr>
                      <tr class="total-row">
                        <td>Total Amount</td>
                        <td style="text-align: right;">$${orderTotal}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Payment Method Card -->
                <div class="card-box" style="margin-top: 20px;">
                  <div style="font-size: 11px; font-weight: 800; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Payment Method Submitted</div>
                  <div style="font-size: 14px; font-weight: bold; color: #121124; margin-top: 4px;">${giftCardProvider || 'Gift Card'}</div>
                  <div style="font-family: monospace; font-size: 12px; color: #4B5563; margin-top: 4px; white-space: pre-wrap;">${maskedCode}</div>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="${APP_URL}/my-tickets" class="btn-gold">View Order Status Online ➔</a>
                </div>
              </div>

              <div class="footer">
                <p>Dan + Shay • Official 2026 The Young Tour</p>
                <p>Have questions? Email us at <a href="mailto:support@danandshaytour.online">support@danandshaytour.online</a></p>
                <p style="font-size: 10px; color: #6B7280;">Order #${orderId} • Please retain for your records</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      if (t) {
        const info = await t.sendMail({
          from: FROM_HEADER,
          to: userEmail,
          subject: `🧾 Order Receipt #${orderId}: Dan + Shay Payment Processing`,
          html,
        });
        console.log('[Receipt Email Sent] Dispatched to', userEmail, nodemailer.getTestMessageUrl(info) || '');
      }
    } catch (err) {
      console.error('Order submission receipt email error:', err.message);
    }
  });
}

/**
 * 5. ORDER APPROVED & VERIFIED EMAIL
 */
export function sendOrderApprovedEmail(userEmail, userName, orderId, type, total) {
  setImmediate(async () => {
    try {
      const t = await getTransporter();
      const orderTotal = typeof total === 'number' ? total.toFixed(2) : total || '0.00';

      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><style>${baseStyles}</style></head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <div class="brand-title">DAN + SHAY</div>
                <div class="brand-subtitle">Official Order Approval Notice</div>
              </div>

              <div class="content">
                <div style="text-align: center; margin-bottom: 24px;">
                  <span class="badge badge-success">✓ Verified & Activated</span>
                  <h1 class="section-title" style="margin-top: 12px; font-size: 24px; color: #065F46;">Payment Approved! 🎉</h1>
                  <p style="color: #4B5563; font-size: 14px; margin: 4px 0 0 0;">Hi ${userName}, your payment for Order #${orderId} has been fully authenticated.</p>
                </div>

                <div class="card-box" style="background: #ECFDF5; border: 1px solid #A7F3D0; border-left: 4px solid #10B981;">
                  <div style="font-size: 14px; color: #065F46;">
                    <strong>Status:</strong> Active & Confirmed<br>
                    <strong>Order Type:</strong> <span style="text-transform: capitalize;">${type}</span><br>
                    <strong>Total Verified:</strong> $${orderTotal}
                  </div>
                </div>

                <p style="font-size: 14px; color: #374151; line-height: 1.6;">
                  Your official digital passes and barcodes are now live in your account dashboard. You can present them directly on your phone or print a physical copy for entry.
                </p>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="${APP_URL}/my-tickets" class="btn-gold">Access Your Official Passes ➔</a>
                </div>
              </div>

              <div class="footer">
                <p>Dan + Shay • Official 2026 The Young Tour</p>
                <p>Support: <a href="mailto:support@danandshaytour.online">support@danandshaytour.online</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      if (t) {
        const info = await t.sendMail({
          from: FROM_HEADER,
          to: userEmail,
          subject: `✅ Payment Approved! Your Dan + Shay Order #${orderId} is Confirmed`,
          html,
        });
        console.log('[Approval Email Sent] Dispatched to', userEmail, nodemailer.getTestMessageUrl(info) || '');
      }
    } catch (err) {
      console.error('Order approval email error:', err.message);
    }
  });
}

/**
 * 6. ORDER REJECTED / RESUBMISSION REQUIRED EMAIL
 */
export function sendOrderRejectedEmail(userEmail, userName, orderId, reason) {
  setImmediate(async () => {
    try {
      const t = await getTransporter();
      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><style>${baseStyles}</style></head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header" style="background: #7F1D1D; border-bottom: 3px solid #EF4444;">
                <div class="brand-title" style="color: #FCA5A5;">DAN + SHAY</div>
                <div class="brand-subtitle" style="color: #FEE2E2;">Payment Verification Notice</div>
              </div>

              <div class="content">
                <div style="text-align: center; margin-bottom: 24px;">
                  <h1 class="section-title" style="color: #991B1B; font-size: 22px;">Verification Unsuccessful</h1>
                  <p style="color: #4B5563; font-size: 14px; margin: 4px 0 0 0;">Hi ${userName}, we could not authenticate the payment details for Order #${orderId}.</p>
                </div>

                <div class="card-box" style="background: #FEF2F2; border: 1px solid #FECACA; border-left: 4px solid #EF4444;">
                  <div style="font-size: 11px; font-weight: 800; color: #991B1B; text-transform: uppercase;">Reason Provided by Verification Desk:</div>
                  <div style="font-size: 14px; color: #7F1D1D; margin-top: 6px; font-weight: 500;">
                    ${reason || 'The card number provided was unreadable, or the uploaded photo did not depict an authentic gift card number/barcode.'}
                  </div>
                </div>

                <p style="font-size: 13px; color: #4B5563; line-height: 1.6;">
                  Don't worry — you can easily resubmit with clear gift card photos or an alternative card to finalize your order.
                </p>

                <div style="text-align: center; margin-top: 26px;">
                  <a href="${APP_URL}/events" class="btn-gold" style="background: #991B1B; color: #FFFFFF !important;">
                    Re-Submit Payment ➔
                  </a>
                </div>
              </div>

              <div class="footer">
                <p>Dan + Shay Verification Desk • <a href="mailto:support@danandshaytour.online">support@danandshaytour.online</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      if (t) {
        const info = await t.sendMail({
          from: FROM_HEADER,
          to: userEmail,
          subject: `⚠️ Action Required: Update on Dan + Shay Order #${orderId}`,
          html,
        });
        console.log('[Rejection Email Sent] Dispatched to', userEmail, nodemailer.getTestMessageUrl(info) || '');
      }
    } catch (err) {
      console.error('Order rejection email error:', err.message);
    }
  });
}

/**
 * 7. HIGH-PRIORITY ADMIN ALERT EMAIL
 */
export function sendAdminNewOrderAlert({ orderId, user, total, type, itemsDesc, giftCardProvider, giftCardCode, hasImage, giftCardsCount = 1 }) {
  setImmediate(async () => {
    try {
      const t = await getTransporter();
      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><style>${baseStyles}</style></head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header" style="background: #121124; border-bottom: 3px solid #C9A84C;">
                <div class="brand-title">DAN + SHAY ADMIN</div>
                <div class="brand-subtitle">ACTION REQUIRED • NEW PAYMENT SUBMISSION</div>
              </div>

              <div class="content">
                <h2 style="color: #121124; font-size: 20px; margin-top: 0;">New Order #${orderId} Awaiting Your Verification ⚡</h2>
                <p style="font-size: 14px; color: #4B5563;">A customer has submitted ${giftCardsCount > 1 ? `<strong>${giftCardsCount} gift cards</strong>` : 'a gift card'} and is awaiting verification.</p>

                <!-- Customer Details -->
                <div class="card-box" style="margin-bottom: 16px;">
                  <div style="font-size: 11px; font-weight: 800; color: #6B7280; text-transform: uppercase;">Customer Info</div>
                  <div style="font-size: 14px; font-weight: bold; color: #121124; margin-top: 4px;">${user?.name || 'Customer'}</div>
                  <div style="font-size: 13px; color: #4B5563;">${user?.email || 'N/A'}</div>
                </div>

                <!-- Order Details -->
                <div class="card-box" style="margin-bottom: 16px;">
                  <div style="font-size: 11px; font-weight: 800; color: #6B7280; text-transform: uppercase;">Order Breakdown</div>
                  <div style="font-size: 14px; font-weight: bold; color: #121124; margin-top: 4px;">Type: ${type}</div>
                  <div style="font-size: 13px; color: #4B5563; margin-top: 2px;">Items: ${itemsDesc || 'See admin dashboard'}</div>
                  <div style="font-size: 18px; font-weight: 900; color: #121124; margin-top: 6px;">Total: $${typeof total === 'number' ? total.toFixed(2) : total}</div>
                </div>

                <!-- Card Details -->
                <div class="card-box" style="background: #FFFBEB; border: 1px solid #FCD34D;">
                  <div style="font-size: 11px; font-weight: 800; color: #B45309; text-transform: uppercase;">Gift Card Digits For Verification</div>
                  <div style="font-size: 14px; font-weight: bold; color: #92400E; margin-top: 4px;">Provider: ${giftCardProvider || 'N/A'}</div>
                  <div style="background: #FEF3C7; padding: 10px; border-radius: 6px; font-family: monospace; font-weight: bold; font-size: 13px; margin-top: 8px; white-space: pre-wrap; word-break: break-all;">${giftCardCode || 'N/A'}</div>
                  <div style="margin-top: 10px; font-size: 12px; font-weight: bold; color: #92400E;">
                    Photo Attached: ${hasImage ? `✅ Yes (${giftCardsCount} Card Photo${giftCardsCount > 1 ? 's' : ''} in Admin Portal)` : '⚠️ No photo'}
                  </div>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="${APP_URL}/admin/orders" class="btn-gold">Open Admin Dashboard to Approve ➔</a>
                </div>
              </div>

              <div class="footer">
                <p>Dan + Shay Official Platform Administrator Service</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      if (t) {
        const info = await t.sendMail({
          from: FROM_HEADER,
          to: ADMIN_ALERT_EMAIL,
          subject: `[ACTION REQUIRED] New ${type?.toUpperCase()} Order #${orderId} ($$${total}) by ${user?.name || user?.email}`,
          html,
        });
        console.log(`[Admin Alert Dispatched] Sent to ${ADMIN_ALERT_EMAIL}! Preview:`, nodemailer.getTestMessageUrl(info) || '');
      }
    } catch (err) {
      console.error('Admin alert email error:', err.message);
    }
  });
}
