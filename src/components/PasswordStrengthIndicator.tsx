import React from 'react';
import { Check, X, Eye, EyeOff } from 'lucide-react';
import { 
  validatePassword, 
  getPasswordStrengthColor, 
  getPasswordStrengthText,
  PasswordValidationResult 
} from '@/lib/password-validation';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
  className?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showRequirements = true,
  className = ''
}) => {
  const validation: PasswordValidationResult = validatePassword(password);
  
  if (!password && !showRequirements) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Strength Bar */}
      {password && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  validation.strength === 'strong' ? 'bg-green-500 w-full' :
                  validation.strength === 'medium' ? 'bg-yellow-500 w-2/3' :
                  'bg-red-500 w-1/3'
                }`}
              />
            </div>
            <span className={`text-xs font-medium ${getPasswordStrengthColor(validation.strength)}`}>
              {getPasswordStrengthText(validation.strength)}
            </span>
          </div>
        </div>
      )}

      {/* Requirements List */}
      {showRequirements && (
        <div className="space-y-1">
          <div className="text-xs text-gray-600 mb-2">Password requirements:</div>
          <div className="space-y-1">
            <RequirementItem
              met={validation.requirements.minLength}
              text="At least 8 characters"
            />
            <RequirementItem
              met={validation.requirements.hasUppercase}
              text="One uppercase letter (A-Z)"
            />
            <RequirementItem
              met={validation.requirements.hasLowercase}
              text="One lowercase letter (a-z)"
            />
            <RequirementItem
              met={validation.requirements.hasNumber}
              text="One number (0-9)"
            />
            <RequirementItem
              met={validation.requirements.hasSpecialChar}
              text="One special character (!@#$%^&*)"
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface RequirementItemProps {
  met: boolean;
  text: string;
}

const RequirementItem: React.FC<RequirementItemProps> = ({ met, text }) => (
  <div className="flex items-center gap-2 text-xs">
    {met ? (
      <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
    ) : (
      <X className="w-3 h-3 text-red-500 flex-shrink-0" />
    )}
    <span className={met ? 'text-green-600' : 'text-gray-500'}>
      {text}
    </span>
  </div>
);

interface PasswordInputWithStrengthProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  className?: string;
  showStrengthIndicator?: boolean;
  required?: boolean;
}

export const PasswordInputWithStrength: React.FC<PasswordInputWithStrengthProps> = ({
  value,
  onChange,
  placeholder = "••••••••",
  id,
  name = "password",
  className = "",
  showStrengthIndicator = true,
  required = false
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const validation = validatePassword(value);

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary pr-10 ${className}`}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
      
      {showStrengthIndicator && (
        <PasswordStrengthIndicator 
          password={value} 
          showRequirements={value.length > 0 || required}
        />
      )}
      
      {/* Validation Errors */}
      {value && !validation.isValid && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <div key={index} className="text-xs text-red-500 flex items-center gap-1">
              <X className="w-3 h-3 flex-shrink-0" />
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
