import nodemailer from 'nodemailer';

// Email service configuration
const isGmail = (process.env.SMTP_HOST || '').includes('gmail');
const transporter = nodemailer.createTransport({
  service: isGmail ? 'gmail' : undefined,
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: (process.env.SMTP_PORT || '587') === '465',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email using configured transporter
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@homebonzenga.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: process.env.SMTP_USER || undefined,
    });

    console.log('📧 Email sent:', info.messageId);
    return true;
  } catch (error) {
    const err = error as any;
    console.error('❌ Error sending email:', err?.message || err);
    if (err?.response) console.error('SMTP response:', err.response);
    if (err?.code) console.error('SMTP code:', err.code);
    return false;
  }
}

export async function verifyEmailTransport(): Promise<void> {
  try {
    await transporter.verify();
    console.log('📮 SMTP transport verified and ready');
  } catch (error) {
    const err = error as any;
    console.error('❌ SMTP verify failed:', err?.message || err);
    if (err?.response) console.error('SMTP response:', err.response);
    if (err?.code) console.error('SMTP code:', err.code);
  }
}

/**
 * Send vendor signup notification to managers
 */
export async function sendVendorSignupNotificationToManagers(vendorData: {
  shopName: string;
  ownerName: string;
  email: string;
  phone?: string;
  address?: string;
}): Promise<boolean> {
  const managerEmails = (process.env.MANAGER_EMAILS
    ? process.env.MANAGER_EMAILS.split(',')
    : [process.env.ADMIN_EMAIL || 'admin@homebonzenga.com']
  )
    .map(e => e.trim())
    .filter(e => !!e);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; }
        .button { background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
        .info-row { margin: 10px 0; }
        .label { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Vendor Registration</h1>
        </div>
        <div class="content">
          <p>A new vendor has registered and requires your approval:</p>
          
          <div class="info-row">
            <span class="label">Shop Name:</span> ${vendorData.shopName}
          </div>
          <div class="info-row">
            <span class="label">Owner Name:</span> ${vendorData.ownerName}
          </div>
          <div class="info-row">
            <span class="label">Email:</span> ${vendorData.email}
          </div>
          ${vendorData.phone ? `<div class="info-row"><span class="label">Phone:</span> ${vendorData.phone}</div>` : ''}
          ${vendorData.address ? `<div class="info-row"><span class="label">Address:</span> ${vendorData.address}</div>` : ''}
          
          <p style="margin-top: 30px;">
            Please login to review and approve this vendor application.
          </p>
        </div>
        <div class="footer">
          <p>Home Bonzenga Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send to all managers
  for (const email of managerEmails) {
    console.log(`📨 Sending manager signup notification to: ${email}`);
    await sendEmail({
      to: email,
      subject: `New Vendor Registration: ${vendorData.shopName}`,
      html,
    });
  }

  return true;
}

/**
 * Send approval notification to vendor
 */
export async function sendVendorApprovalNotification(vendorData: {
  email: string;
  shopName: string;
  ownerName: string;
}): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; }
        .button { background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Your Vendor Account Has Been Approved!</h1>
        </div>
        <div class="content">
          <p>Dear ${vendorData.ownerName},</p>
          
          <p>Congratulations! Your vendor account for <strong>${vendorData.shopName}</strong> has been approved.</p>
          
          <p>You can now:</p>
          <ul>
            <li>Log in to your vendor dashboard</li>
            <li>Add your services</li>
            <li>Manage your bookings</li>
            <li>Start receiving customer appointments</li>
          </ul>
          
          <p style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/vendor/login" class="button">
              Access Your Dashboard
            </a>
          </p>
          
          <p style="margin-top: 30px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
        <div class="footer">
          <p>Thank you for being part of Home Bonzenga!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: vendorData.email,
    subject: 'Your Vendor Account Has Been Approved - Home Bonzenga',
    html,
  });
}

/**
 * Send rejection notification to vendor
 */
export async function sendVendorRejectionNotification(vendorData: {
  email: string;
  shopName: string;
  ownerName: string;
  reason?: string;
}): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; }
        .reason-box { background: white; padding: 15px; margin: 20px 0; border-left: 4px solid #ef4444; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Vendor Application Status Update</h1>
        </div>
        <div class="content">
          <p>Dear ${vendorData.ownerName},</p>
          
          <p>We regret to inform you that your vendor application for <strong>${vendorData.shopName}</strong> has been reviewed and cannot be approved at this time.</p>
          
          ${vendorData.reason ? `
            <div class="reason-box">
              <strong>Reason:</strong>
              <p>${vendorData.reason}</p>
            </div>
          ` : ''}
          
          <p>We encourage you to review the reasons provided and consider reapplying once you have addressed the concerns.</p>
          
          <p style="margin-top: 30px;">
            If you have any questions, please contact our support team.
          </p>
          
          <p>We appreciate your interest in Home Bonzenga.</p>
        </div>
        <div class="footer">
          <p>Best regards,<br>Home Bonzenga Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: vendorData.email,
    subject: 'Vendor Application Status Update - Home Bonzenga',
    html,
  });
}

