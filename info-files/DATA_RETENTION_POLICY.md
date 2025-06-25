# Veridect Data Retention Policy

## Overview
This document outlines Veridect's data retention practices to ensure compliance with GDPR, user privacy expectations, and operational requirements.

## Data Categories and Retention Periods

### 1. User Account Data
**Retention Period:** Until account deletion requested
- User profiles (name, email, preferences)
- Authentication data (password hashes, OAuth IDs)
- Subscription information (active subscriptions only)

**Deletion Process:**
- User-initiated deletion via profile settings
- Admin-assisted deletion via info@veridect.com
- Complete data purge within 30 days of request

### 2. Food Analysis Data
**Retention Period:** 2 years from last user activity
- Food logs and analysis results
- AI-generated explanations and verdicts
- User interaction patterns

**Automatic Cleanup:**
- Inactive accounts (>2 years): Quarterly review and purge
- Anonymous analytics retained for service improvement

### 3. Financial Data
**Retention Period:** 7 years (legal requirement)
- Stripe customer IDs and subscription records
- Payment history and transaction logs
- Tax-related financial records

**Security:**
- No credit card data stored (handled by Stripe)
- Encrypted storage of financial identifiers

### 4. Technical Data
**Retention Period:** 90 days
- Server logs and error reports
- Performance metrics and usage statistics
- Security audit trails

**Rotation:**
- Daily log rotation
- Automatic purge after 90 days
- Critical security events retained for legal compliance

### 5. Session Data
**Retention Period:** 7 days (automatic cleanup)
- User sessions stored in PostgreSQL
- Automatic expiration and cleanup
- No persistent session storage beyond TTL

## Data Processing Purposes

### Primary Purposes
- Service delivery (food analysis, user management)
- Subscription management and billing
- Customer support and communication
- Security monitoring and fraud prevention

### Secondary Purposes (Opt-in)
- Product improvement and analytics
- Marketing communications (with consent)
- Research and development (anonymized)

## User Rights and Controls

### Access Rights
- Complete data export via profile settings
- Real-time access to all stored personal data
- Transparency reports on data processing

### Deletion Rights
- Self-service account deletion
- Selective data deletion (food logs, preferences)
- Right to be forgotten (complete erasure)

### Portability Rights
- JSON export of all user data
- Structured data format for easy migration
- API access for automated data retrieval

## Technical Implementation

### Automated Cleanup Processes
```typescript
// Daily cleanup job (implemented in server/scheduler.ts)
- Expired sessions removal
- Old password reset tokens cleanup
- Inactive user identification

// Weekly cleanup job
- Log file rotation and archival
- Performance metric aggregation
- Security audit log compilation

// Monthly compliance review
- Inactive account identification (>6 months)
- Data retention policy compliance check
- GDPR consent status review
```

### Data Anonymization
- User IDs replaced with random identifiers for analytics
- Personal identifiers removed from research datasets
- IP addresses masked for privacy protection

## Compliance and Monitoring

### GDPR Compliance
- Legal basis documented for all data processing
- Consent tracking and management
- Regular compliance audits (quarterly)

### Monitoring and Alerts
- Data retention policy violations (automated alerts)
- Unusual data access patterns (security monitoring)
- User data export/deletion request tracking

### Audit Trail
- All data access logged with timestamps
- User consent changes tracked
- Data deletion activities recorded

## Contact and Updates

**Data Protection Contact:** info@veridect.com
**Policy Updates:** Users notified 30 days before changes
**Last Updated:** June 25, 2025
**Next Review:** September 25, 2025

## Implementation Status

### Completed
- ✅ User data export functionality
- ✅ Account deletion process (contact-based)
- ✅ Session cleanup automation
- ✅ Password reset token expiration

### In Progress
- 🔄 Automated inactive account identification
- 🔄 GDPR consent collection completion
- 🔄 Self-service data deletion interface

### Planned
- 📋 Advanced analytics anonymization
- 📋 Automated compliance reporting
- 📋 Enhanced user privacy controls

---

*This policy is reviewed quarterly and updated as needed to maintain compliance with applicable data protection regulations.*