# 📧 Email Templates & Authentication Setup Guide

This guide walks you through setting up beautiful, branded email templates for your UPI Piggy application.

## 🎯 **What's Implemented**

✅ **Beautiful Email Templates**
- Welcome email for new users with branding
- Email verification with security messaging
- Password reset with security warnings
- Account activity alerts

✅ **Multi-Provider Support**
- SendGrid (Recommended)
- Mailgun
- AWS SES
- Console logging (for development)

✅ **Smart Authentication Flow**
- Enhanced user signup with profiles
- Custom error messages
- Automatic welcome emails
- Empty state for new users vs demo data for demo users

## 🚀 **Quick Setup**

### 1. **Environment Configuration**

Copy and configure your environment variables:

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual values
```

**Required Variables:**
```bash
# Application URL
VITE_APP_URL=http://localhost:8080  # or your domain

# Supabase (Required)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Service (Choose one)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@your-domain.com
SENDGRID_FROM_NAME=UPI Piggy
```

### 2. **SendGrid Setup (Recommended)**

1. **Create SendGrid Account**
   - Visit [SendGrid](https://sendgrid.com)
   - Sign up for free (100 emails/day)

2. **Get API Key**
   ```bash
   # Go to Settings > API Keys > Create API Key
   # Give it "Full Access" or "Mail Send" permissions
   ```

3. **Verify Domain/Email**
   ```bash
   # Go to Settings > Sender Authentication
   # Verify your domain or single sender email
   ```

4. **Update Environment**
   ```bash
   SENDGRID_API_KEY=SG.your-actual-api-key-here
   SENDGRID_FROM_EMAIL=noreply@your-verified-domain.com
   SENDGRID_FROM_NAME=UPI Piggy
   ```

### 3. **Alternative: Mailgun Setup**

```bash
# Environment variables
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your-domain.com
```

### 4. **Alternative: AWS SES Setup**

```bash
# Environment variables
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
SES_FROM_EMAIL=noreply@your-domain.com
```

## 🎨 **Email Templates**

### **Welcome Email**
- Beautiful gradient header with UPI Piggy branding
- Feature highlights with icons
- Call-to-action button
- Security tips
- Mobile-responsive design

### **Email Verification**
- Clean, professional design
- Clear verification button
- Security messaging
- Link expiration notice

### **Password Reset**
- Security-focused design with warnings
- Clear reset button
- Expiration notice (1 hour)
- Alternative text link

### **Account Activity**
- Alert-style design
- Activity details table
- Action buttons (Secure Account, Contact Support)
- Security team branding

## 🔧 **Development Mode**

In development, emails are logged to the console:

```typescript
// This will show in your terminal
console.log('📧 EMAIL SENT (CONSOLE MODE)');
console.log('To: user@example.com');
console.log('Subject: Welcome to UPI Piggy');
// ... full email content
```

## 🏗️ **Integration Examples**

### **Using the Email Service**

```typescript
import { emailService } from '@/lib/email-service';
import { welcomeEmailTemplate } from '@/lib/email-templates';

// Send welcome email
const template = welcomeEmailTemplate('John Doe');
const result = await emailService.sendTemplateEmail(
  'user@example.com',
  template,
  { userId: '123', source: 'web' }
);

if (result.success) {
  console.log('Email sent successfully!');
} else {
  console.error('Email failed:', result.error);
}
```

### **Custom Templates**

```typescript
// Create your own template
const customTemplate: EmailTemplate = {
  subject: "Your Investment Update",
  html: `
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h1>Investment Summary</h1>
        <p>Your portfolio has grown by 12%!</p>
      </body>
    </html>
  `,
  text: "Your portfolio has grown by 12%!"
};

await emailService.sendTemplateEmail(email, customTemplate);
```

## 🎭 **User Experience Changes**

### **New Users (Empty State)**
- Welcome message with onboarding steps
- Empty portfolio and transaction states
- Guided tour prompts
- No mock data

### **Demo Users**
- Full mock data experience
- Sample transactions and holdings
- Interactive features enabled

### **Authentication Flow**
- Enhanced signup with profile creation
- Automatic welcome emails
- Better error messages
- Email verification support

## 🛠️ **Production Deployment**

### **Supabase Email Templates**

Configure custom email templates in Supabase:

1. **Go to Authentication > Email Templates**
2. **Update templates to use your branding:**

```html
<!-- Supabase Confirmation Email -->
<h2>Confirm your email</h2>
<p>Hi there! Thanks for signing up for UPI Piggy.</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email address</a></p>
```

### **Production Checklist**

- [ ] Domain verification completed
- [ ] Email service API keys configured
- [ ] SMTP settings tested
- [ ] Email deliverability tested
- [ ] SPF/DKIM records configured
- [ ] Bounce handling set up
- [ ] Email analytics configured

## 📊 **Monitoring & Analytics**

### **Email Metrics**
```typescript
// Track email events
console.log('📧 Email sent:', {
  template: 'welcome',
  userId: user.id,
  provider: 'sendgrid',
  timestamp: new Date().toISOString()
});
```

### **Error Handling**
```typescript
// Email service handles errors gracefully
if (!result.success) {
  // Log error for monitoring
  console.error('Email delivery failed:', {
    error: result.error,
    recipient: maskedEmail,
    template: templateName
  });
}
```

## 🚨 **Security Considerations**

✅ **Email Masking**: Email addresses are masked in logs
✅ **Rate Limiting**: Prevents email spam
✅ **Validation**: Email format validation
✅ **Expiration**: Password reset links expire
✅ **Security Headers**: Proper email headers set

## 🆘 **Troubleshooting**

### **Common Issues**

**1. Emails not sending**
```bash
# Check environment variables
echo $SENDGRID_API_KEY
# Should not be empty
```

**2. SendGrid 401 Error**
```bash
# Check API key permissions
# Ensure "Mail Send" permission is enabled
```

**3. Domain verification fails**
```bash
# Check DNS records
dig TXT your-domain.com
# Should show SendGrid verification record
```

**4. Emails going to spam**
```bash
# Set up SPF record:
# v=spf1 include:sendgrid.net ~all

# Set up DKIM in SendGrid dashboard
```

### **Development Issues**

**Console emails not showing:**
```typescript
// Check NODE_ENV
console.log(process.env.NODE_ENV);
// Should be 'development' for console mode
```

**Template rendering issues:**
```typescript
// Check template syntax
const template = welcomeEmailTemplate('Test User');
console.log(template.html); // Should show rendered HTML
```

## 🎉 **Testing**

### **Test Email Templates**

```bash
# Run the development server
npm run dev

# Create a test account
# Check console for email output

# Or test with real email service:
NODE_ENV=production npm run dev
```

### **Template Preview**

Create an email preview page for testing:

```typescript
// pages/EmailPreview.tsx
import { welcomeEmailTemplate } from '@/lib/email-templates';

const EmailPreview = () => {
  const template = welcomeEmailTemplate('John Doe');
  
  return (
    <div dangerouslySetInnerHTML={{ __html: template.html }} />
  );
};
```

## 🔄 **Updates & Maintenance**

### **Adding New Templates**

1. Create template in `src/lib/email-templates.ts`
2. Add to email service usage
3. Test with console mode
4. Deploy and test with real service

### **Updating Existing Templates**

1. Modify template function
2. Test with different user names/data
3. Check mobile responsiveness
4. Update text version too

---

**🎯 Ready to send beautiful emails to your UPI Piggy users!**

*Need help? Check the console logs or create an issue in the repository.*
