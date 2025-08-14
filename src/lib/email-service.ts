// Email Service with Multiple Provider Support
import { EmailTemplate } from './email-templates';

export interface EmailConfig {
  provider: 'sendgrid' | 'mailgun' | 'ses' | 'console'; // console for development
  apiKey?: string;
  domain?: string;
  fromEmail: string;
  fromName: string;
  region?: string; // for AWS SES
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
  template?: EmailTemplate;
}

export class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  /**
   * Send email using the configured provider
   */
  async sendEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
    try {
      switch (this.config.provider) {
        case 'sendgrid':
          return await this.sendWithSendGrid(emailData);
        case 'mailgun':
          return await this.sendWithMailgun(emailData);
        case 'ses':
          return await this.sendWithSES(emailData);
        case 'console':
        default:
          return this.logToConsole(emailData);
      }
    } catch (error) {
      console.error('Email sending error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown email error' 
      };
    }
  }

  /**
   * Send email with template
   */
  async sendTemplateEmail(
    to: string,
    template: EmailTemplate,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> {
    const emailData: EmailData = {
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      template
    };

    // Log email for analytics/debugging
    console.log('📧 Sending templated email:', {
      to: this.maskEmail(to),
      subject: template.subject,
      provider: this.config.provider,
      metadata
    });

    return await this.sendEmail(emailData);
  }

  /**
   * SendGrid implementation
   */
  private async sendWithSendGrid(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
    // Note: In a real implementation, you would use @sendgrid/mail
    // This is a placeholder showing how to structure it
    
    const payload = {
      personalizations: [{
        to: [{ email: emailData.to }],
        subject: emailData.subject
      }],
      from: {
        email: this.config.fromEmail,
        name: this.config.fromName
      },
      content: [
        {
          type: 'text/plain',
          value: emailData.text
        },
        {
          type: 'text/html',
          value: emailData.html
        }
      ]
    };

    console.log('📧 SendGrid email payload prepared:', {
      to: this.maskEmail(emailData.to),
      subject: emailData.subject
    });

    // Simulate API call
    // In real implementation:
    /*
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      return { success: false, error: `SendGrid API error: ${response.status}` };
    }
    */

    return { success: true };
  }

  /**
   * Mailgun implementation
   */
  private async sendWithMailgun(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
    const formData = new FormData();
    formData.append('from', `${this.config.fromName} <${this.config.fromEmail}>`);
    formData.append('to', emailData.to);
    formData.append('subject', emailData.subject);
    formData.append('text', emailData.text);
    formData.append('html', emailData.html);

    console.log('📧 Mailgun email prepared:', {
      to: this.maskEmail(emailData.to),
      subject: emailData.subject
    });

    // Simulate API call
    // In real implementation:
    /*
    const response = await fetch(`https://api.mailgun.net/v3/${this.config.domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${this.config.apiKey}`).toString('base64')}`
      },
      body: formData
    });
    
    if (!response.ok) {
      return { success: false, error: `Mailgun API error: ${response.status}` };
    }
    */

    return { success: true };
  }

  /**
   * AWS SES implementation
   */
  private async sendWithSES(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
    const payload = {
      Source: `${this.config.fromName} <${this.config.fromEmail}>`,
      Destination: {
        ToAddresses: [emailData.to]
      },
      Message: {
        Subject: {
          Data: emailData.subject,
          Charset: 'UTF-8'
        },
        Body: {
          Text: {
            Data: emailData.text,
            Charset: 'UTF-8'
          },
          Html: {
            Data: emailData.html,
            Charset: 'UTF-8'
          }
        }
      }
    };

    console.log('📧 AWS SES email prepared:', {
      to: this.maskEmail(emailData.to),
      subject: emailData.subject
    });

    // Simulate API call
    // In real implementation, you would use AWS SDK
    /*
    import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
    
    const client = new SESClient({ 
      region: this.config.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
    
    const command = new SendEmailCommand(payload);
    const response = await client.send(command);
    */

    return { success: true };
  }

  /**
   * Console logging for development
   */
  private logToConsole(emailData: EmailData): { success: boolean } {
    console.log('\n' + '='.repeat(80));
    console.log('📧 EMAIL SENT (CONSOLE MODE)');
    console.log('='.repeat(80));
    console.log(`To: ${emailData.to}`);
    console.log(`From: ${this.config.fromName} <${this.config.fromEmail}>`);
    console.log(`Subject: ${emailData.subject}`);
    console.log('-'.repeat(80));
    console.log('HTML Content:');
    console.log(emailData.html.substring(0, 500) + (emailData.html.length > 500 ? '...' : ''));
    console.log('-'.repeat(80));
    console.log('Text Content:');
    console.log(emailData.text);
    console.log('='.repeat(80) + '\n');
    
    return { success: true };
  }

  /**
   * Mask email address for logging
   */
  private maskEmail(email: string): string {
    const [name, domain] = email.split('@');
    if (name.length <= 2) return `${'*'.repeat(name.length)}@${domain}`;
    return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
  }

  /**
   * Validate email configuration
   */
  static validateConfig(config: EmailConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.fromEmail) {
      errors.push('fromEmail is required');
    }

    if (!config.fromName) {
      errors.push('fromName is required');
    }

    if (config.provider === 'sendgrid' && !config.apiKey) {
      errors.push('SendGrid API key is required');
    }

    if (config.provider === 'mailgun' && (!config.apiKey || !config.domain)) {
      errors.push('Mailgun API key and domain are required');
    }

    if (config.provider === 'ses' && !config.region) {
      errors.push('AWS SES region is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Create email service instance from environment variables
 */
export function createEmailService(): EmailService {
  const config: EmailConfig = {
    provider: (process.env.NODE_ENV === 'development' ? 'console' : 'sendgrid') as EmailConfig['provider'],
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@piggy-upi.com',
    fromName: process.env.SENDGRID_FROM_NAME || 'UPI Piggy',
    apiKey: process.env.SENDGRID_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
    region: process.env.AWS_REGION || 'us-east-1'
  };

  // Validate configuration
  const validation = EmailService.validateConfig(config);
  if (!validation.valid && config.provider !== 'console') {
    console.warn('Email configuration issues:', validation.errors);
    console.warn('Falling back to console logging for emails');
    config.provider = 'console';
  }

  return new EmailService(config);
}

// Export singleton instance
export const emailService = createEmailService();
