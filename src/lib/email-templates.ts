// Email Templates for UPI Piggy Authentication
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Welcome Email Template
export const welcomeEmailTemplate = (userName: string): EmailTemplate => ({
  subject: "🐷 Welcome to UPI Piggy - Start Your Wealth Journey!",
  html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to UPI Piggy</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .welcome-text { font-size: 18px; color: #334155; line-height: 1.6; margin-bottom: 30px; }
        .features { margin: 30px 0; }
        .feature { display: flex; align-items: center; margin-bottom: 20px; }
        .feature-icon { width: 24px; height: 24px; margin-right: 15px; }
        .feature-text { color: #475569; font-size: 16px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
        .security-note { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🐷 Welcome to UPI Piggy!</h1>
        </div>
        
        <div class="content">
          <p class="welcome-text">
            Hi ${userName},<br><br>
            Welcome to India's first UPI round-up investing platform! You're now part of a community that believes every rupee saved is a rupee invested in your future.
          </p>
          
          <div class="features">
            <div class="feature">
              <span class="feature-icon">🔄</span>
              <span class="feature-text"><strong>Automatic Round-ups:</strong> Turn spare change into investments</span>
            </div>
            <div class="feature">
              <span class="feature-icon">📊</span>
              <span class="feature-text"><strong>Smart Portfolios:</strong> Balanced ETF investments in Nifty & Gold</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🛡️</span>
              <span class="feature-text"><strong>Bank-grade Security:</strong> Your data is protected with AES-256 encryption</span>
            </div>
            <div class="feature">
              <span class="feature-icon">📱</span>
              <span class="feature-text"><strong>Mobile-first Design:</strong> Optimized for Indian users</span>
            </div>
          </div>
          
          <a href="${process.env.VITE_APP_URL || 'https://piggy-upi.vercel.app'}" class="cta-button">
            Start Your Wealth Journey →
          </a>
          
          <div class="security-note">
            <strong>🔒 Security Tip:</strong> We'll never ask for your password via email. Always log in directly through our official website.
          </div>
          
          <p style="margin-top: 30px; color: #64748b;">
            Need help getting started? Check out our <a href="#" style="color: #667eea;">quick start guide</a> or reach out to our support team.
          </p>
        </div>
        
        <div class="footer">
          <p><strong>UPI Piggy</strong> - Transform Your Spare Change Into Wealth</p>
          <p>Made with ❤️ for Indian Investors</p>
          <p style="margin-top: 20px; font-size: 12px;">
            This email was sent to you because you created an account with UPI Piggy.<br>
            If you didn't create this account, please ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
    Welcome to UPI Piggy!
    
    Hi ${userName},
    
    Welcome to India's first UPI round-up investing platform! You're now part of a community that believes every rupee saved is a rupee invested in your future.
    
    What you can do with UPI Piggy:
    • Automatic Round-ups: Turn spare change into investments
    • Smart Portfolios: Balanced ETF investments in Nifty & Gold
    • Bank-grade Security: Your data is protected with AES-256 encryption
    • Mobile-first Design: Optimized for Indian users
    
    Get started: ${process.env.VITE_APP_URL || 'https://piggy-upi.vercel.app'}
    
    Security Tip: We'll never ask for your password via email. Always log in directly through our official website.
    
    Need help? Contact our support team or check out our quick start guide.
    
    Best regards,
    The UPI Piggy Team
    
    ---
    UPI Piggy - Transform Your Spare Change Into Wealth
    Made with ❤️ for Indian Investors
  `
});

// Email Verification Template
export const emailVerificationTemplate = (verificationUrl: string): EmailTemplate => ({
  subject: "🔐 Verify Your UPI Piggy Email Address",
  html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 40px 30px; text-align: center; }
        .verification-text { font-size: 18px; color: #334155; line-height: 1.6; margin-bottom: 30px; }
        .verify-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
        .security-info { background-color: #f0f9ff; border: 1px solid #0ea5e9; padding: 20px; border-radius: 8px; margin: 30px 0; }
        .footer { background-color: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
        .expiry-note { color: #ef4444; font-size: 14px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Verify Your Email</h1>
        </div>
        
        <div class="content">
          <p class="verification-text">
            Thanks for signing up with UPI Piggy! To complete your account setup and start your wealth-building journey, please verify your email address.
          </p>
          
          <a href="${verificationUrl}" class="verify-button">
            Verify Email Address
          </a>
          
          <div class="security-info">
            <p><strong>🛡️ Security First</strong></p>
            <p>This verification ensures your account is secure and helps us protect your financial data with bank-grade security.</p>
          </div>
          
          <p class="expiry-note">
            ⏰ This verification link expires in 24 hours for your security.
          </p>
          
          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            If you didn't create a UPI Piggy account, please ignore this email. The account will not be activated without verification.
          </p>
        </div>
        
        <div class="footer">
          <p><strong>UPI Piggy</strong></p>
          <p>Transform Your Spare Change Into Wealth</p>
          <p style="margin-top: 15px; font-size: 12px;">
            Having trouble with the button? Copy and paste this link into your browser:<br>
            <span style="word-break: break-all; color: #667eea;">${verificationUrl}</span>
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
    Verify Your UPI Piggy Email Address
    
    Thanks for signing up with UPI Piggy! To complete your account setup and start your wealth-building journey, please verify your email address.
    
    Click here to verify: ${verificationUrl}
    
    Security First: This verification ensures your account is secure and helps us protect your financial data with bank-grade security.
    
    This verification link expires in 24 hours for your security.
    
    If you didn't create a UPI Piggy account, please ignore this email. The account will not be activated without verification.
    
    UPI Piggy - Transform Your Spare Change Into Wealth
  `
});

// Password Reset Template
export const passwordResetTemplate = (resetUrl: string): EmailTemplate => ({
  subject: "🔑 Reset Your UPI Piggy Password",
  html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 40px 30px; text-align: center; }
        .reset-text { font-size: 18px; color: #334155; line-height: 1.6; margin-bottom: 30px; }
        .reset-button { display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
        .security-warning { background-color: #fef2f2; border: 1px solid #fca5a5; padding: 20px; border-radius: 8px; margin: 30px 0; }
        .footer { background-color: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
        .expiry-note { color: #ef4444; font-size: 14px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔑 Reset Your Password</h1>
        </div>
        
        <div class="content">
          <p class="reset-text">
            We received a request to reset your UPI Piggy account password. Click the button below to create a new password.
          </p>
          
          <a href="${resetUrl}" class="reset-button">
            Reset Password
          </a>
          
          <div class="security-warning">
            <p><strong>⚠️ Security Alert</strong></p>
            <p>If you didn't request this password reset, please ignore this email. Your account remains secure.</p>
            <p>For additional security, consider enabling 2FA in your account settings.</p>
          </div>
          
          <p class="expiry-note">
            ⏰ This reset link expires in 1 hour for your security.
          </p>
        </div>
        
        <div class="footer">
          <p><strong>UPI Piggy Security Team</strong></p>
          <p>Protecting Your Wealth Journey</p>
          <p style="margin-top: 15px; font-size: 12px;">
            Having trouble? Copy and paste this link into your browser:<br>
            <span style="word-break: break-all; color: #667eea;">${resetUrl}</span>
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
    Reset Your UPI Piggy Password
    
    We received a request to reset your UPI Piggy account password. Click the link below to create a new password.
    
    Reset link: ${resetUrl}
    
    Security Alert: If you didn't request this password reset, please ignore this email. Your account remains secure.
    
    This reset link expires in 1 hour for your security.
    
    For additional security, consider enabling 2FA in your account settings.
    
    UPI Piggy Security Team
    Protecting Your Wealth Journey
  `
});

// Account Activity Alert Template
export const accountActivityTemplate = (activity: string, location: string, time: string): EmailTemplate => ({
  subject: "🔔 UPI Piggy Account Activity Alert",
  html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Activity Alert</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .activity-details { background-color: #fefbf2; border: 1px solid #fbbf24; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .details-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .details-label { font-weight: 600; color: #92400e; }
        .details-value { color: #451a03; }
        .action-buttons { text-align: center; margin: 30px 0; }
        .secure-button { display: inline-block; background: #dc2626; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; margin: 10px; }
        .contact-button { display: inline-block; background: #1f2937; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; margin: 10px; }
        .footer { background-color: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 Account Activity Alert</h1>
        </div>
        
        <div class="content">
          <p>We detected new activity on your UPI Piggy account. Please review the details below:</p>
          
          <div class="activity-details">
            <div class="details-row">
              <span class="details-label">Activity:</span>
              <span class="details-value">${activity}</span>
            </div>
            <div class="details-row">
              <span class="details-label">Time:</span>
              <span class="details-value">${time}</span>
            </div>
            <div class="details-row">
              <span class="details-label">Location:</span>
              <span class="details-value">${location}</span>
            </div>
          </div>
          
          <p>If this was you, no action is needed. If you don't recognize this activity, please secure your account immediately.</p>
          
          <div class="action-buttons">
            <a href="#" class="secure-button">Secure My Account</a>
            <a href="#" class="contact-button">Contact Support</a>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>UPI Piggy Security Team</strong></p>
          <p>Monitoring your account 24/7 for suspicious activity</p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
    UPI Piggy Account Activity Alert
    
    We detected new activity on your UPI Piggy account:
    
    Activity: ${activity}
    Time: ${time}
    Location: ${location}
    
    If this was you, no action is needed. If you don't recognize this activity, please secure your account immediately.
    
    Contact our support team if you need assistance.
    
    UPI Piggy Security Team
    Monitoring your account 24/7
  `
});
