import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Upload, 
  User, 
  FileText, 
  CreditCard, 
  MapPin,
  Calendar,
  Phone,
  Mail,
  Shield,
  Info
} from 'lucide-react';

interface KYCFormData {
  // Personal Info
  fullName: string;
  dateOfBirth: string;
  gender: string;
  fatherName: string;
  motherName: string;
  
  // Contact Info
  email: string;
  phone: string;
  
  // Address
  address: string;
  city: string;
  state: string;
  pincode: string;
  
  // Identity
  panNumber: string;
  aadhaarNumber: string;
  
  // Bank Details
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  
  // Income
  annualIncome: string;
  occupation: string;
  
  // Documents
  panCard: File | null;
  aadhaarCard: File | null;
  bankStatement: File | null;
  photo: File | null;
}

const KYCPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<KYCFormData>({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    fatherName: '',
    motherName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    panNumber: '',
    aadhaarNumber: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    annualIncome: '',
    occupation: '',
    panCard: null,
    aadhaarCard: null,
    bankStatement: null,
    photo: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (field: keyof KYCFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: keyof KYCFormData, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.fullName && formData.dateOfBirth && formData.gender && 
                 formData.fatherName && formData.email && formData.phone);
      case 2:
        return !!(formData.address && formData.city && formData.state && formData.pincode);
      case 3:
        return !!(formData.panNumber && formData.aadhaarNumber && 
                 formData.accountNumber && formData.ifscCode && formData.bankName);
      case 4:
        return !!(formData.panCard && formData.aadhaarCard && 
                 formData.bankStatement && formData.photo);
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate KYC submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, this would:
      // 1. Upload documents to secure storage
      // 2. Submit data to KYC verification service
      // 3. Create verification record in database
      // 4. Send confirmation email
      
      console.log('KYC submitted successfully:', formData);
    } catch (err) {
      setError('KYC submission failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const FileUploader = ({ 
    label, 
    field, 
    accept = ".jpg,.jpeg,.png,.pdf",
    required = true 
  }: {
    label: string;
    field: keyof KYCFormData;
    accept?: string;
    required?: boolean;
  }) => (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Upload size={16} />
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="border-2 border-dashed border-border rounded-lg p-4">
        <input
          type="file"
          accept={accept}
          onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
          className="w-full"
        />
        {formData[field] && (
          <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 size={16} />
            File uploaded: {(formData[field] as File).name}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="text-primary" size={32} />
            <h1 className="text-3xl font-heading font-bold">Complete Your KYC</h1>
          </div>
          <p className="text-muted-foreground mb-4">
            Know Your Customer verification is required for regulatory compliance
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-6">
            <Progress value={progress} className="w-64 h-2" />
            <span className="text-sm font-medium">{currentStep}/{totalSteps}</span>
          </div>

          <Alert className="max-w-2xl mx-auto">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your information is encrypted and secure. We comply with RBI and SEBI guidelines 
              for financial services. This process typically takes 24-48 hours for verification.
            </AlertDescription>
          </Alert>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && <User className="text-primary" size={24} />}
              {currentStep === 2 && <MapPin className="text-primary" size={24} />}
              {currentStep === 3 && <CreditCard className="text-primary" size={24} />}
              {currentStep === 4 && <FileText className="text-primary" size={24} />}
              
              {currentStep === 1 && 'Personal Information'}
              {currentStep === 2 && 'Address Details'}
              {currentStep === 3 && 'Financial Information'}
              {currentStep === 4 && 'Document Upload'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name (As per PAN) *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father's Name *</Label>
                  <Input
                    id="fatherName"
                    value={formData.fatherName}
                    onChange={(e) => handleInputChange('fatherName', e.target.value)}
                    placeholder="Father's full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="motherName">Mother's Name</Label>
                  <Input
                    id="motherName"
                    value={formData.motherName}
                    onChange={(e) => handleInputChange('motherName', e.target.value)}
                    placeholder="Mother's full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Address */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Complete Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="House No., Street, Area"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Mumbai"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select onValueChange={(value) => handleInputChange('state', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="karnataka">Karnataka</SelectItem>
                        <SelectItem value="gujarat">Gujarat</SelectItem>
                        {/* Add all Indian states */}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pincode">PIN Code *</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      placeholder="400001"
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Financial Info */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="panNumber">PAN Number *</Label>
                    <Input
                      id="panNumber"
                      value={formData.panNumber}
                      onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
                    <Input
                      id="aadhaarNumber"
                      value={formData.aadhaarNumber}
                      onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)}
                      placeholder="1234 5678 9012"
                      maxLength={12}
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Bank Account Number *</Label>
                    <Input
                      id="accountNumber"
                      value={formData.accountNumber}
                      onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                      placeholder="1234567890123456"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ifscCode">IFSC Code *</Label>
                    <Input
                      id="ifscCode"
                      value={formData.ifscCode}
                      onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                      placeholder="HDFC0001234"
                      maxLength={11}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => handleInputChange('bankName', e.target.value)}
                      placeholder="HDFC Bank"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="annualIncome">Annual Income</Label>
                    <Select onValueChange={(value) => handleInputChange('annualIncome', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select income range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-2.5L">Below ₹2.5 Lakhs</SelectItem>
                        <SelectItem value="2.5-5L">₹2.5 - 5 Lakhs</SelectItem>
                        <SelectItem value="5-10L">₹5 - 10 Lakhs</SelectItem>
                        <SelectItem value="10-25L">₹10 - 25 Lakhs</SelectItem>
                        <SelectItem value="25L+">Above ₹25 Lakhs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                      placeholder="Software Engineer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Documents */}
            {currentStep === 4 && (
              <div className="grid md:grid-cols-2 gap-6">
                <FileUploader
                  label="PAN Card"
                  field="panCard"
                  accept=".jpg,.jpeg,.png,.pdf"
                />
                
                <FileUploader
                  label="Aadhaar Card (Front & Back)"
                  field="aadhaarCard"
                  accept=".jpg,.jpeg,.png,.pdf"
                />
                
                <FileUploader
                  label="Bank Statement (Last 3 months)"
                  field="bankStatement"
                  accept=".pdf"
                />
                
                <FileUploader
                  label="Passport Size Photo"
                  field="photo"
                  accept=".jpg,.jpeg,.png"
                />
                
                <div className="md:col-span-2">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Document Guidelines:</strong><br />
                      • All documents should be clear and readable<br />
                      • File size should be less than 5MB each<br />
                      • Accepted formats: JPG, PNG, PDF<br />
                      • Ensure all corners of the document are visible
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className="bg-gradient-growth"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!validateStep(currentStep) || isLoading}
                  className="bg-gradient-growth"
                >
                  {isLoading ? 'Submitting KYC...' : 'Submit for Verification'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* KYC Status Info */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <h3 className="font-heading font-semibold mb-4">What happens next?</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1">1</Badge>
                <div>
                  <h4 className="font-medium mb-1">Document Review</h4>
                  <p className="text-sm text-muted-foreground">
                    Our team reviews your submitted documents
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1">2</Badge>
                <div>
                  <h4 className="font-medium mb-1">Verification</h4>
                  <p className="text-sm text-muted-foreground">
                    We verify details with government databases
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1">3</Badge>
                <div>
                  <h4 className="font-medium mb-1">Activation</h4>
                  <p className="text-sm text-muted-foreground">
                    Your account gets activated for investments
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KYCPage;
