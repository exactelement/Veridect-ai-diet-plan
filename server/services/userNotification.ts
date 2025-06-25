import { sendEmail } from './email';

export async function notifyDataBreachVictim(userEmail: string, breachDetails: {
  incident_date: string;
  data_accessed: string[];
  unauthorized_user: string;
}) {
  const subject = 'Important Security Notice - Data Access Incident';
  
  const emailContent = `
Dear User,

We are writing to inform you of a security incident that may have affected your personal data.

INCIDENT DETAILS:
- Date: ${breachDetails.incident_date}
- Issue: Unauthorized access to your data export
- Data accessed: ${breachDetails.data_accessed.join(', ')}
- Unauthorized accessor: ${breachDetails.unauthorized_user}

IMMEDIATE ACTIONS TAKEN:
- The security vulnerability has been fixed
- All affected systems have been secured
- Additional authentication measures implemented

YOUR DATA PROTECTION RIGHTS:
Under GDPR, you have the right to:
- Request details about how your data is processed
- Request correction of inaccurate data
- Request deletion of your data
- Lodge a complaint with supervisory authorities

NEXT STEPS:
- No action required from you
- We recommend reviewing your account activity
- Contact us if you have any concerns

We sincerely apologize for this incident and have implemented additional security measures to prevent similar occurrences.

Contact: support@veridect.com
Privacy Policy: https://veridect.com/privacy

Best regards,
Veridect Security Team
  `;

  return await sendEmail({
    to: userEmail,
    from: 'security@veridect.com',
    subject,
    text: emailContent,
    html: emailContent.replace(/\n/g, '<br>')
  });
}