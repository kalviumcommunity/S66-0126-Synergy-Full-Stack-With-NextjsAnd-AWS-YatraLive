## Step 13: Email Notifications Implementation Guide

### Overview

Complete email notification system with subscription management, multiple provider support (AWS SES & SendGrid), React Email templates, and worker integration.

### 🎯 Implementation Summary

#### 1. **Package Dependencies Added**

```json
"@aws-sdk/client-ses": "^3.515.0",
"@sendgrid/mail": "^8.1.3",
"react-email": "^0.0.16",
"@react-email/components": "^0.0.16"
```

Install with: `npm install`

#### 2. **Prisma Schema Updates**

Added two new models to `prisma/schema.prisma`:

**EmailSubscription Model**

- Manages user email preferences
- Stores verification/unsubscribe tokens
- Tracks subscription status and verification state
- Stores user notification preferences (JSON)

**EmailLog Model**

- Audit trail of all emails sent
- Tracks delivery status (PENDING, SENT, FAILED, BOUNCED)
- Links to trigger events (train delays, platform changes)
- Provider message ID for debugging

### 📧 Email Provider Architecture

#### Location: `lib/email/providers/`

**File Structure:**

- `types.ts` - EmailProvider interface and options
- `factory.ts` - Dynamic provider factory pattern
- `ses.ts` - AWS SES provider implementation
- `sendgrid.ts` - SendGrid provider implementation

**Factory Pattern:**

```typescript
const provider = getEmailProvider(); // Returns active provider
provider.send(to, subject, html, text); // Provider-agnostic API
```

**Configuration via Environment:**

- `EMAIL_PROVIDER=AWS_SES` (default)
- `EMAIL_PROVIDER=SENDGRID` (alternative)

### 🎨 Email Templates

#### Location: `lib/email/templates/`

**DelayAlert.tsx**

- Train delay notifications
- Shows: train info, delay duration, estimated impact
- Includes action button to view train details
- Plain text fallback included

**PlatformChange.tsx**

- Platform/track change notifications
- Shows: old → new platform, station, train info
- Visual emphasis on platform change
- Plain text fallback included

Both templates use React Email 2.0 for beautiful, responsive HTML emails.

### 🔧 Email Service Layer

#### Location: `lib/services/emailService.tsx`

**Subscription Management:**

- `subscribeToEmails(email)` - Create subscription with verification token
- `verifyEmailSubscription(token)` - Confirm email ownership
- `unsubscribeFromEmails(token)` - Opt out permanently
- `getSubscription(email)` - Check subscription status
- `updateSubscriptionPreferences(email, prefs)` - Update notification settings

**Email Sending:**

- `sendDelayAlert(email, trainData)` - Send delay notifications
- `sendPlatformChangeAlert(email, trainData)` - Send platform change alerts
- Automatic logging of all sent emails
- Error handling with fallback logging

**Email Logs:**

- `getEmailLogs(filters)` - Retrieve email history with filtering

### 📡 API Routes

#### Location: `app/api/subscriptions/`

**POST /api/subscriptions**

- Subscribe new email
- Returns verification token
- Validates email format

**GET /api/subscriptions?email=**

- Check subscription status
- Returns: isActive, isVerified, preferences

**GET /api/subscriptions/verify?token=**

- Verify email with token from email link
- Updates isVerified flag

**GET /api/subscriptions/unsubscribe?token=**

- Unsubscribe with token from email footer
- Updates isActive flag

### 🎯 UI Components

#### SubscribeButton Component

Location: `components/layout/SubscribeButton.tsx`

**Features:**

- Modal form for email subscription
- Email validation
- Success/error messaging
- Unobtrusive design

**Usage:**

```tsx
import { SubscribeButton } from '@/components/layout/SubscribeButton';

<SubscribeButton variant="button" /> // Standard button
<SubscribeButton variant="inline" /> // Inline compact form
```

### ✅ Verification & Unsubscribe Pages

**Pages:**

- `app/subscription-verified/page.tsx` - Confirmation after email verification
- `app/unsubscribed/page.tsx` - Confirmation after unsubscribe

**Features:**

- Automatic token verification on page load
- User-friendly success/error messages
- Links to manage preferences or return home

### 🔌 Worker Integration

#### Location: `worker/hooks/emailHooks.ts`

**Email Hooks:**

- `checkAndSendDelayAlerts(trains)` - Monitor for significant delays
- `checkAndSendPlatformChangeAlerts(trains)` - Monitor for platform changes

**Behavior:**

- Tracks previous state to detect changes
- Respects user preferences (delay alerts, platform alerts)
- Rate limiting: 10 emails/minute default
- Graceful error handling per email

**Integration in Worker:**
Added to `worker/index.ts` runCycle method:

```typescript
await checkAndSendDelayAlerts(relevantTrains);
await checkAndSendPlatformChangeAlerts(relevantTrains);
```

### 🧪 Testing

#### Test Email Script

Location: `scripts/test-email.ts`

**Tests:**

1. Email provider connectivity
2. Subscription creation
3. Email verification
4. Delay alert sending
5. Platform change alert sending
6. Email log retrieval

**Usage:**

```bash
npm run test:email
```

**NPM Script Added:**

```json
"test:email": "tsx scripts/test-email.ts"
```

### 🔐 Environment Configuration

#### .env.local (Development)

```env
EMAIL_PROVIDER=AWS_SES
AWS_REGION=ap-south-1
AWS_SES_FROM_EMAIL=noreply@traintracker.local
# AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY (set as needed)
```

#### .env.docker (Docker)

```env
EMAIL_PROVIDER=AWS_SES
AWS_REGION=ap-south-1
AWS_SES_FROM_EMAIL=noreply@traintracker.local
```

#### .env.example (Template)

Documented all email configuration options with provider selection

### 📊 Database Migrations

Run migration to create tables:

```bash
npx prisma migrate dev --name add_email_notifications
```

Creates:

- `email_subscriptions` table
- `email_logs` table
- Necessary indexes for performance

### ✨ Key Features

✅ **Multi-Provider Support** - Easily switch between AWS SES and SendGrid  
✅ **Subscription Management** - User-controlled email preferences  
✅ **Email Verification** - Confirm email ownership via token links  
✅ **Unsubscribe Support** - One-click unsubscribe with token links  
✅ **Beautiful Templates** - React Email components with text fallbacks  
✅ **Rate Limiting** - Configurable limits to prevent spam  
✅ **Audit Trail** - Complete email log with status tracking  
✅ **Error Handling** - Graceful failures with detailed logging  
✅ **Worker Integration** - Automatic alerts for train events  
✅ **Type-Safe** - Full TypeScript support

### 🚀 Deployment Checklist

- [ ] Install dependencies: `npm install`
- [ ] Update Prisma client: `npm run prisma:generate`
- [ ] Create migration: `npx prisma migrate dev`
- [ ] Configure environment variables
- [ ] Set AWS credentials or SendGrid API key
- [ ] Test email system: `npm run test:email`
- [ ] Deploy worker to production
- [ ] Monitor email logs via admin panel

### 📝 Next Steps

1. **Add email provider credentials** to deployment environment
2. **Integrate SubscribeButton** into main pages
3. **Monitor email delivery** using admin dashboard
4. **Adjust thresholds** for delay alerts as needed
5. **Add email templates** for other events (cancellations, recoveries)

### 💡 Example Usage

**Subscribe User:**

```javascript
const result = await subscribeToEmails('user@example.com');
// User receives verification email with token link
// Link: /api/subscriptions/verify?token=...
```

**Send Delay Alert:**

```javascript
await sendDelayAlert('user@example.com', {
  trainNumber: 'RAJ12345',
  trainName: 'Rajdhani Express',
  source: 'New Delhi',
  destination: 'Mumbai Central',
  scheduledTime: '08:15',
  currentDelay: 15,
  estimatedDelay: 25,
});
```

**Unsubscribe:**

```javascript
await unsubscribeFromEmails(unsubscribeToken);
// User is marked as inactive, stops receiving emails
```

---

**Files Created/Modified:**

- Package.json (dependencies + test:email script)
- prisma/schema.prisma (EmailSubscription, EmailLog models)
- lib/email/providers/\* (4 new provider files)
- lib/email/templates/\* (2 new template files)
- lib/services/emailService.tsx (comprehensive service)
- app/api/subscriptions/\* (3 API route files)
- worker/hooks/emailHooks.ts (worker integration)
- components/layout/SubscribeButton.tsx (UI component)
- app/subscription-verified/page.tsx (verification page)
- app/unsubscribed/page.tsx (unsubscribe page)
- scripts/test-email.ts (test script)
- .env files (configuration templates)

**Total Implementation:** 15+ files, 2000+ lines of code
