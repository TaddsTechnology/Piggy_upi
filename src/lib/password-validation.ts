/**
 * Password validation utility with comprehensive rules
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

export interface PasswordValidationOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecialChar?: boolean;
  allowWhitespace?: boolean;
}

const DEFAULT_OPTIONS: Required<PasswordValidationOptions> = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  allowWhitespace: false
};

/**
 * Validates password against security requirements
 */
export function validatePassword(
  password: string, 
  options: PasswordValidationOptions = {}
): PasswordValidationResult {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const errors: string[] = [];
  
  // Check minimum length
  const hasMinLength = password.length >= config.minLength;
  if (!hasMinLength) {
    errors.push(`Password must be at least ${config.minLength} characters long`);
  }

  // Check for uppercase letter (A-Z)
  const hasUppercase = /[A-Z]/.test(password);
  if (config.requireUppercase && !hasUppercase) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  }

  // Check for lowercase letter (a-z)
  const hasLowercase = /[a-z]/.test(password);
  if (config.requireLowercase && !hasLowercase) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  }

  // Check for number (0-9)
  const hasNumber = /[0-9]/.test(password);
  if (config.requireNumber && !hasNumber) {
    errors.push('Password must contain at least one number (0-9)');
  }

  // Check for special character
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  if (config.requireSpecialChar && !hasSpecialChar) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;\':",./<>?~`)');
  }

  // Check for whitespace
  const hasWhitespace = /\s/.test(password);
  if (!config.allowWhitespace && hasWhitespace) {
    errors.push('Password cannot contain spaces');
  }

  // Calculate password strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  const strengthScore = [
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar
  ].filter(Boolean).length;

  if (strengthScore >= 5) strength = 'strong';
  else if (strengthScore >= 3) strength = 'medium';

  // Additional strength factors
  if (password.length >= 12) strength = strength === 'medium' ? 'strong' : strength;

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    requirements: {
      minLength: hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar
    }
  };
}

/**
 * Get password strength color for UI display
 */
export function getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak': return 'text-red-500';
    case 'medium': return 'text-yellow-500';
    case 'strong': return 'text-green-500';
    default: return 'text-gray-500';
  }
}

/**
 * Get password strength text
 */
export function getPasswordStrengthText(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak': return 'Weak';
    case 'medium': return 'Medium';
    case 'strong': return 'Strong';
    default: return 'Unknown';
  }
}

/**
 * Common password patterns to avoid
 */
export const COMMON_WEAK_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 
  'password123', 'admin', 'letmein', 'welcome', '123123'
];

/**
 * Check if password is commonly used weak password
 */
export function isCommonPassword(password: string): boolean {
  return COMMON_WEAK_PASSWORDS.includes(password.toLowerCase());
}

/**
 * Generate password requirements text for display
 */
export function getPasswordRequirements(): string[] {
  return [
    'At least 8 characters long',
    'One uppercase letter (A-Z)',
    'One lowercase letter (a-z)',
    'One number (0-9)',
    'One special character (!@#$%^&*)',
    'No spaces allowed'
  ];
}
