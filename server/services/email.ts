import { MailService } from '@sendgrid/mail';

let mailService: MailService | null = null;

// Initializing SendGrid service
if (process.env.SENDGRID_API_KEY) {
  // SendGrid API key found, initializing service
  mailService = new MailService();
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
  // SendGrid service initialized successfully
} else {
  // SendGrid API key not found - emails will be logged to console
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!mailService) {
    // Development mode: log email details
    if (process.env.NODE_ENV === 'development') {
      console.log('SendGrid not configured, logging email instead:');
      console.log(`To: ${params.to}`);
      console.log(`Subject: ${params.subject}`);
      console.log(`Body: ${params.text || params.html}`);
    }
    return false;
  }

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Attempting to send email to ${params.to} via SendGrid...`);
      console.log(`From: ${params.from}`);
      console.log(`Subject: ${params.subject}`);
    }
    
    const result = await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('SendGrid email sent successfully! Status:', result[0].statusCode);
    }
    return true;
  } catch (error) {
    console.error('SendGrid email failed:', error.message);
    if (error.response && error.response.body) {
      console.error('SendGrid error details:', JSON.stringify(error.response.body, null, 2));
    }
    return false;
  }
}

export function generatePasswordResetEmail(email: string, resetToken: string, baseUrl: string) {
  const resetUrl = `${baseUrl}/login?token=${resetToken}`;
  
  return {
    to: email,
    from: 'noreply@10xr.es', // Must be verified in SendGrid
    subject: 'Reset Your Veridect Password',
    text: `
Hello,

You requested a password reset for your Veridect account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this reset, please ignore this email.

Best regards,
The Veridect Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Veridect</h1>
      <p>Password Reset Request</p>
    </div>
    <div class="content">
      <h2>Reset Your Password</h2>
      <p>You requested a password reset for your Veridect account.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" class="button">Reset Password</a>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">${resetUrl}</p>
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you didn't request this reset, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>The Veridect Team</p>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}