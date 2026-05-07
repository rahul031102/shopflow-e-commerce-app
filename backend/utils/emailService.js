const nodemailer = require('nodemailer');
const logger = require('./logger');

/**
 * Creates a transporter. In development uses Ethereal (fake SMTP).
 * In production, uses env-configured SMTP (SendGrid, Mailgun, etc.)
 */
const createTransporter = async () => {
  if (process.env.NODE_ENV === 'development') {
    // Auto-create a throwaway Ethereal test account
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Core send function.
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: `"ShopFlow" <${process.env.SMTP_FROM || 'no-reply@shopflow.com'}>`,
      to,
      subject,
      html,
    });

    if (process.env.NODE_ENV === 'development') {
      logger.info(`📧 Email preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return info;
  } catch (err) {
    // Log but don't crash the server on email failure
    logger.error(`Email send failed: ${err.message}`);
  }
};

// ─── Email Templates ──────────────────────────────────────────────────────────

const sendWelcomeEmail = (user) =>
  sendEmail({
    to: user.email,
    subject: '🎉 Welcome to ShopFlow!',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
        <h1 style="color:#6366F1;margin-bottom:8px;">Welcome, ${user.name}! 🛍️</h1>
        <p style="color:#374151;font-size:16px;line-height:1.7;">
          Your ShopFlow account is all set. Start exploring thousands of products with fast shipping and secure checkout.
        </p>
        <a href="${process.env.CLIENT_URL}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#6366F1;color:#fff;border-radius:999px;text-decoration:none;font-weight:700;">
          Start Shopping →
        </a>
        <p style="color:#9CA3AF;font-size:13px;margin-top:32px;">If you didn't create this account, you can safely ignore this email.</p>
      </div>
    `,
  });

const sendOrderConfirmationEmail = (user, order) =>
  sendEmail({
    to: user.email,
    subject: `✅ Order Confirmed — #${order._id.toString().slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
        <h1 style="color:#6366F1;">Order Confirmed! 🎉</h1>
        <p style="color:#374151;">Hi ${user.name}, thanks for your order. Here's a summary:</p>

        <div style="background:#fff;border-radius:8px;padding:20px;margin:20px 0;border:1px solid #E5E7EB;">
          <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
          <p><strong>Status:</strong> ${order.orderStatus}</p>
          <p><strong>Payment:</strong> ${order.isPaid ? '✅ Paid' : '⏳ Pending'}</p>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <thead>
            <tr style="background:#F3F4F6;">
              <th style="padding:10px;text-align:left;font-size:13px;color:#6B7280;">Item</th>
              <th style="padding:10px;text-align:right;font-size:13px;color:#6B7280;">Qty</th>
              <th style="padding:10px;text-align:right;font-size:13px;color:#6B7280;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${order.orderItems.map(item => `
              <tr style="border-bottom:1px solid #E5E7EB;">
                <td style="padding:10px;font-size:14px;">${item.name}</td>
                <td style="padding:10px;text-align:right;font-size:14px;">${item.quantity}</td>
                <td style="padding:10px;text-align:right;font-size:14px;">$${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="text-align:right;padding:16px;background:#fff;border-radius:8px;border:1px solid #E5E7EB;">
          <p style="color:#6B7280;font-size:14px;">Subtotal: $${order.itemsPrice?.toFixed(2)}</p>
          <p style="color:#6B7280;font-size:14px;">Shipping: ${order.shippingPrice === 0 ? 'FREE' : '$' + order.shippingPrice?.toFixed(2)}</p>
          <p style="color:#6B7280;font-size:14px;">Tax: $${order.taxPrice?.toFixed(2)}</p>
          <p style="font-size:18px;font-weight:700;color:#111827;margin-top:8px;">Total: $${order.totalPrice?.toFixed(2)}</p>
        </div>

        <a href="${process.env.CLIENT_URL}/orders/${order._id}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#6366F1;color:#fff;border-radius:999px;text-decoration:none;font-weight:700;">
          Track Your Order →
        </a>

        <p style="color:#9CA3AF;font-size:12px;margin-top:32px;">ShopFlow · Questions? Reply to this email.</p>
      </div>
    `,
  });

const sendPasswordResetEmail = (user, resetToken) =>
  sendEmail({
    to: user.email,
    subject: '🔒 Reset Your ShopFlow Password',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
        <h1 style="color:#6366F1;">Password Reset Request</h1>
        <p style="color:#374151;font-size:16px;line-height:1.7;">
          Hi ${user.name}, we received a request to reset your password. Click the button below — this link expires in <strong>15 minutes</strong>.
        </p>
        <a href="${process.env.CLIENT_URL}/reset-password/${resetToken}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#EF4444;color:#fff;border-radius:999px;text-decoration:none;font-weight:700;">
          Reset Password →
        </a>
        <p style="color:#9CA3AF;font-size:13px;margin-top:32px;">
          If you didn't request this, ignore this email. Your password won't change.
        </p>
      </div>
    `,
  });

const sendOrderStatusEmail = (user, order) =>
  sendEmail({
    to: user.email,
    subject: `📦 Your Order is ${order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
        <h1 style="color:#6366F1;">Order Update</h1>
        <p style="color:#374151;font-size:16px;">Hi ${user.name}, your order status has been updated.</p>
        <div style="background:#fff;border-radius:8px;padding:20px;margin:20px 0;border:1px solid #E5E7EB;">
          <p><strong>Order:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
          <p><strong>New Status:</strong> <span style="font-weight:700;color:#6366F1;">${order.orderStatus.toUpperCase()}</span></p>
          ${order.trackingNumber ? `<p><strong>Tracking:</strong> ${order.trackingNumber}</p>` : ''}
        </div>
        <a href="${process.env.CLIENT_URL}/orders/${order._id}" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#6366F1;color:#fff;border-radius:999px;text-decoration:none;font-weight:700;">
          View Order →
        </a>
      </div>
    `,
  });

module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
  sendOrderStatusEmail,
};
