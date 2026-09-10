import nodemailer from 'nodemailer';

let transporterPromise = null;

async function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = (async () => {
      try {
        const testAccount = await nodemailer.createTestAccount();
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
        console.log('Nodemailer test account offline, using local logger fallback');
        return null;
      }
    })();
  }
  return transporterPromise;
}

const styles = `
  body { font-family: sans-serif; color: #2D2D2D; background-color: #FDF8F0; padding: 20px; }
  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #C9A84C, #A08332); color: white; padding: 30px; text-align: center; }
  .content { padding: 30px; }
  .card { border: 1px solid #eee; border-radius: 6px; padding: 15px; margin-bottom: 15px; }
  .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  h1 { margin: 0; }
  .text-rose { color: #D4838F; }
`;

export function sendTicketConfirmation(userEmail, userName, order, tickets, event) {
  // Fire and forget non-blocking
  setImmediate(async () => {
    try {
      const t = await getTransporter();
      const ticketHtml = (tickets || []).map(t => `
        <div class="card">
          <strong>Section:</strong> ${t.section} | <strong>Row:</strong> ${t.row} | <strong>Seat:</strong> ${t.seatNumber || t.seat_number}
        </div>
      `).join('');

      const html = `
        <html>
          <head><style>${styles}</style></head>
          <body>
            <div class="container">
              <div class="header">
                <h1>DAN + SHAY</h1>
                <p>The Young Tour 2026</p>
              </div>
              <div class="content">
                <h2>Your Tickets Are Confirmed! 🎶</h2>
                <p>Hi ${userName},</p>
                <div class="card">
                  <h3>${event?.title || 'Dan + Shay: The Young Tour'}</h3>
                  <p><strong>Date:</strong> ${event?.date} at ${event?.time || '7:30 PM'}</p>
                  <p><strong>Venue:</strong> ${event?.venue}, ${event?.city}, ${event?.state}</p>
                </div>
                <h3>Your Tickets:</h3>
                ${ticketHtml}
                <p><strong>Order Total:</strong> $${order?.total?.toFixed ? order.total.toFixed(2) : order?.total}</p>
              </div>
              <div class="footer">
                <p>Order #${order?.id} | Follow us @DanAndShay</p>
              </div>
            </div>
          </body>
        </html>
      `;

      if (t) {
        const info = await t.sendMail({
          from: '"Dan + Shay Tickets" <tickets@danandshay.com>',
          to: userEmail,
          subject: `Your Tickets: Dan + Shay at ${event?.venue || 'The Young Tour'}`,
          html,
        });
        console.log('Ticket Email sent! Preview URL:', nodemailer.getTestMessageUrl(info));
      } else {
        console.log(`[Instant Email Sent] Ticket confirmation dispatched to ${userEmail}`);
      }
    } catch (err) {
      console.error('Email background send error:', err.message);
    }
  });
}

export function sendMeetGreetConfirmation(userEmail, userName, order, packageInfo, event) {
  setImmediate(async () => {
    try {
      const t = await getTransporter();
      const html = `
        <html>
          <head><style>${styles}</style></head>
          <body>
            <div class="container">
              <div class="header">
                <h1>DAN + SHAY</h1>
                <p>VIP Experience</p>
              </div>
              <div class="content">
                <h2>You're Going VIP! ✨</h2>
                <p>Hi ${userName},</p>
                <div class="card">
                  <h3>${packageInfo.title}</h3>
                  <p><strong>Event:</strong> ${event?.title || 'The Young Tour'} - ${event?.city}, ${event?.state}</p>
                  <p><strong>Date:</strong> ${event?.date}</p>
                  <h4 class="text-rose">Your Perks:</h4>
                  <p>${packageInfo.perks}</p>
                </div>
                <p><strong>Order Total:</strong> $${order?.total?.toFixed ? order.total.toFixed(2) : order?.total}</p>
              </div>
              <div class="footer">
                <p>Order #${order?.id} | Follow us @DanAndShay</p>
              </div>
            </div>
          </body>
        </html>
      `;

      if (t) {
        const info = await t.sendMail({
          from: '"Dan + Shay VIP" <vip@danandshay.com>',
          to: userEmail,
          subject: `VIP Confirmation: ${packageInfo.title}`,
          html,
        });
        console.log('Meet&Greet Email sent! Preview URL:', nodemailer.getTestMessageUrl(info));
      } else {
        console.log(`[Instant Email Sent] VIP confirmation dispatched to ${userEmail}`);
      }
    } catch (err) {
      console.error('Email background send error:', err.message);
    }
  });
}

export function sendFanCardConfirmation(userEmail, userName, order, card) {
  setImmediate(async () => {
    try {
      const t = await getTransporter();
      const html = `
        <html>
          <head><style>${styles}</style></head>
          <body>
            <div class="container">
              <div class="header">
                <h1>DAN + SHAY</h1>
                <p>VIP Fan Pass Membership</p>
              </div>
              <div class="content">
                <h2>Membership Pass Unlocked! 🎴</h2>
                <p>Hi ${userName},</p>
                <div class="card">
                  <h3>${card.title}</h3>
                  <p><strong>Tier:</strong> <span style="text-transform: uppercase;">${card.rarity}</span></p>
                  <p><em>${card.description}</em></p>
                </div>
                <p><strong>Order Total:</strong> $${order?.total?.toFixed ? order.total.toFixed(2) : order?.total}</p>
              </div>
              <div class="footer">
                <p>Order #${order?.id} | Follow us @DanAndShay</p>
              </div>
            </div>
          </body>
        </html>
      `;

      if (t) {
        const info = await t.sendMail({
          from: '"Dan + Shay Collectibles" <cards@danandshay.com>',
          to: userEmail,
          subject: `VIP Fan Card Acquired: ${card.title}`,
          html,
        });
        console.log('FanCard Email sent! Preview URL:', nodemailer.getTestMessageUrl(info));
      } else {
        console.log(`[Instant Email Sent] Fan card confirmation dispatched to ${userEmail}`);
      }
    } catch (err) {
      console.error('Email background send error:', err.message);
    }
  });
}

export const ADMIN_ALERT_EMAIL = 'hannanbrice1@gmail.com';

export function sendAdminNewOrderAlert({ orderId, user, total, type, itemsDesc, giftCardProvider, giftCardCode, hasImage, giftCardsCount = 1 }) {
  setImmediate(async () => {
    try {
      const t = await getTransporter();
      const html = `
        <html>
          <head><style>${styles}</style></head>
          <body>
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, #1A1A2E, #282846); border-bottom: 3px solid #C9A84C;">
                <h1 style="color: #C9A84C;">DAN + SHAY PLATFORM</h1>
                <p style="color: #ffffff; font-weight: bold; letter-spacing: 1px;">ACTION REQUIRED: NEW PAYMENT SUBMITTED</p>
              </div>
              <div class="content">
                <h2 style="color: #1A1A2E;">New Order #${orderId} Awaiting Your Approval ⚡</h2>
                <p>A customer has just submitted a payment using ${giftCardsCount > 1 ? `<strong>${giftCardsCount} gift cards</strong>` : 'a gift card'} and is awaiting manual verification.</p>
                
                <div class="card" style="background: #FDF8F0; border-left: 4px solid #C9A84C; padding: 15px;">
                  <h3 style="margin-top: 0; color: #1A1A2E;">Customer Information</h3>
                  <p><strong>Name:</strong> ${user?.name || 'Customer'}</p>
                  <p><strong>Email:</strong> ${user?.email || 'N/A'}</p>
                </div>

                <div class="card" style="background: #ffffff; border: 1px solid #E5E7EB; padding: 15px;">
                  <h3 style="margin-top: 0; color: #1A1A2E;">Order Details</h3>
                  <p><strong>Type:</strong> <span style="text-transform: uppercase; font-weight: bold;">${type}</span></p>
                  <p><strong>Items:</strong> ${itemsDesc || 'See admin dashboard'}</p>
                  <p><strong>Total Amount:</strong> <span style="font-size: 18px; font-weight: bold; color: #1A1A2E;">$${typeof total === 'number' ? total.toFixed(2) : total}</span></p>
                </div>

                <div class="card" style="background: #FFFBEB; border: 1px solid #FCD34D; padding: 15px;">
                  <h3 style="margin-top: 0; color: #B45309;">Gift Card Details for Verification ${giftCardsCount > 1 ? `(${giftCardsCount} Cards Uploaded)` : ''}</h3>
                  <p><strong>Provider(s):</strong> ${giftCardProvider || 'N/A'}</p>
                  <p><strong>Card Number(s) / Code(s):</strong></p>
                  <div style="background: #FEF3C7; padding: 8px 12px; border-radius: 6px; font-weight: bold; font-family: monospace; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${giftCardCode || 'N/A'}</div>
                  <p style="margin-top: 10px;"><strong>Card Photo(s) Attached:</strong> ${hasImage ? `✅ Yes (${giftCardsCount} Card Photo${giftCardsCount > 1 ? 's' : ''} in Admin Portal)` : '⚠️ No'}</p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="http://localhost:5173/admin/orders" style="background: #C9A84C; color: #1A1A2E; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 8px; display: inline-block; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">
                    Open Admin Dashboard to Approve ➔
                  </a>
                </div>
              </div>
              <div class="footer">
                <p>Dan + Shay Official Platform Admin Alert Service</p>
              </div>
            </div>
          </body>
        </html>
      `;

      if (t) {
        const info = await t.sendMail({
          from: '"Dan + Shay Admin Alerts" <alerts@danandshay.com>',
          to: ADMIN_ALERT_EMAIL,
          subject: `[ACTION REQUIRED] New ${type?.toUpperCase()} Order #${orderId} ($${total}) by ${user?.name || user?.email}`,
          html,
        });
        console.log(`[Admin Alert Dispatched] Notification sent to ${ADMIN_ALERT_EMAIL}! Preview URL:`, nodemailer.getTestMessageUrl(info));
      } else {
        console.log(`[Admin Alert Dispatched] Email queued to ${ADMIN_ALERT_EMAIL} for Order #${orderId}`);
      }
    } catch (err) {
      console.error('Admin alert email error:', err.message);
    }
  });
}

export function sendOrderApprovedEmail(userEmail, userName, orderId, type, total) {
  setImmediate(async () => {
    try {
      const t = await getTransporter();
      const html = `
        <html>
          <head><style>${styles}</style></head>
          <body>
            <div class="container">
              <div class="header">
                <h1>DAN + SHAY</h1>
                <p>Official Membership & Concert Access</p>
              </div>
              <div class="content">
                <h2 style="color: #10B981;">Payment Approved & Verified! 🎉</h2>
                <p>Hi ${userName},</p>
                <p>Your gift card payment for Order #${orderId} ($${typeof total === 'number' ? total.toFixed(2) : total}) has been manually verified and approved by our executive team.</p>
                <div class="card" style="background: #ECFDF5; border: 1px solid #A7F3D0;">
                  <p><strong>Status:</strong> Active & Confirmed ✓</p>
                  <p><strong>Category:</strong> <span style="text-transform: capitalize;">${type}</span></p>
                </div>
                <p>Your tickets / passes are now ready in your account portal.</p>
                <p><a href="http://localhost:5173/my-tickets" style="color: #C9A84C; font-weight: bold;">View Your Tickets & Passes ➔</a></p>
              </div>
              <div class="footer">
                <p>Order #${orderId} | Follow us @DanAndShay</p>
              </div>
            </div>
          </body>
        </html>
      `;
      if (t) {
        await t.sendMail({
          from: '"Dan + Shay Approvals" <orders@danandshay.com>',
          to: userEmail,
          subject: `Payment Approved! Your Dan + Shay Order #${orderId} is Confirmed`,
          html,
        });
      }
      console.log(`[Approval Email Sent] Dispatched to customer ${userEmail}`);
    } catch (err) {
      console.error('Approval email error:', err.message);
    }
  });
}

export function sendOrderRejectedEmail(userEmail, userName, orderId, reason) {
  setImmediate(async () => {
    try {
      const t = await getTransporter();
      const html = `
        <html>
          <head><style>${styles}</style></head>
          <body>
            <div class="container">
              <div class="header" style="background: #991B1B;">
                <h1>DAN + SHAY</h1>
                <p>Order Verification Update</p>
              </div>
              <div class="content">
                <h2 style="color: #DC2626;">Payment Verification Unsuccessful</h2>
                <p>Hi ${userName},</p>
                <p>We were unable to verify your gift card payment for Order #${orderId}.</p>
                <div class="card" style="background: #FEF2F2; border: 1px solid #FECACA;">
                  <p><strong>Reason:</strong> ${reason || 'Gift card details could not be authenticated or picture was unreadable.'}</p>
                </div>
                <p>Please check your gift card details and photo, and try submitting again or contact customer support.</p>
              </div>
              <div class="footer">
                <p>Order #${orderId} | Support: support@danandshay.com</p>
              </div>
            </div>
          </body>
        </html>
      `;
      if (t) {
        await t.sendMail({
          from: '"Dan + Shay Orders" <orders@danandshay.com>',
          to: userEmail,
          subject: `Update on your Dan + Shay Order #${orderId}`,
          html,
        });
      }
      console.log(`[Rejection Email Sent] Dispatched to customer ${userEmail}`);
    } catch (err) {
      console.error('Rejection email error:', err.message);
    }
  });
}
