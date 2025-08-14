// Security Middleware for Production
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Rate Limiting Configuration
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit auth attempts
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true,
});

export const transactionRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Max 10 transactions per minute
  message: {
    error: 'Transaction rate limit exceeded. Please wait before making another transaction.',
    retryAfter: '1 minute'
  }
});

// Security Headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
      connectSrc: ["'self'", "https://*.supabase.co", "https://api.razorpay.com"],
      imgSrc: ["'self'", "data:", "https:"],
      frameSrc: ["'self'", "https://api.razorpay.com"]
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// CORS Configuration
export const corsConfig = cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com', 'https://www.your-domain.com']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
});

// Input Validation Rules
export const userValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .escape()
    .withMessage('Valid email is required'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be 8+ chars with uppercase, lowercase, number, and special character'),
  
  body('fullName')
    .trim()
    .escape()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name must contain only letters and spaces'),
];

export const transactionValidation = [
  body('amount')
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage('Amount must be between 0.01 and 1,000,000'),
  
  body('merchant')
    .trim()
    .escape()
    .isLength({ max: 100 })
    .withMessage('Merchant name too long'),
  
  body('upiRef')
    .trim()
    .escape()
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage('Invalid UPI reference format')
];

export const kycValidation = [
  body('panNumber')
    .trim()
    .escape()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage('Invalid PAN format'),
  
  body('aadhaarNumber')
    .trim()
    .escape()
    .matches(/^[0-9]{12}$/)
    .withMessage('Invalid Aadhaar format'),
  
  body('phoneNumber')
    .trim()
    .escape()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid Indian phone number')
];

// Validation Error Handler
export const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Password Hashing Utilities
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// JWT Utilities
export const generateToken = (payload: any): string => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '24h',
    issuer: 'upi-piggy',
    audience: 'upi-piggy-users'
  });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
};

// Session Management
export class SessionManager {
  private static activeSessions = new Map<string, Set<string>>();
  private static readonly MAX_SESSIONS_PER_USER = 3;
  private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

  static addSession(userId: string, sessionId: string): boolean {
    if (!this.activeSessions.has(userId)) {
      this.activeSessions.set(userId, new Set());
    }
    
    const userSessions = this.activeSessions.get(userId)!;
    
    // Limit concurrent sessions
    if (userSessions.size >= this.MAX_SESSIONS_PER_USER) {
      // Remove oldest session (simplified - in production use Redis with TTL)
      const oldestSession = Array.from(userSessions)[0];
      userSessions.delete(oldestSession);
    }
    
    userSessions.add(sessionId);
    
    // Set timeout for session cleanup
    setTimeout(() => {
      this.removeSession(userId, sessionId);
    }, this.SESSION_TIMEOUT);
    
    return true;
  }

  static removeSession(userId: string, sessionId: string): void {
    const userSessions = this.activeSessions.get(userId);
    if (userSessions) {
      userSessions.delete(sessionId);
      if (userSessions.size === 0) {
        this.activeSessions.delete(userId);
      }
    }
  }

  static isValidSession(userId: string, sessionId: string): boolean {
    const userSessions = this.activeSessions.get(userId);
    return userSessions ? userSessions.has(sessionId) : false;
  }

  static invalidateAllSessions(userId: string): void {
    this.activeSessions.delete(userId);
  }
}

// CSRF Protection
export const csrfToken = () => {
  return require('crypto').randomBytes(32).toString('hex');
};

export const verifyCsrfToken = (token: string, sessionToken: string): boolean => {
  // In production, store CSRF tokens in secure session store
  return token === sessionToken;
};
