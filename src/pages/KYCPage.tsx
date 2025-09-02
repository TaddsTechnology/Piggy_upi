import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import KYCService, { KYCFormData, KYCDocuments, KYCStatus } from '@/lib/kyc-service';
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
  Info,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Building,
  IndianRupee,
  Zap,
  Camera,
  Clock
} from 'lucide-react';

// Use types from KYC service
interface LocalKYCFormData extends KYCFormData {
  motherName: string; // Make motherName required in local interface
  // Documents
  panCard: File | null;
  aadhaarCard: File | null;
  bankStatement: File | null;
  photo: File | null;
}

const KYCPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<LocalKYCFormData>({
    fullName: user?.user_metadata?.full_name || '',
    dateOfBirth: '',
    gender: '',
    fatherName: '',
    motherName: '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
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
  const [kycSubmitted, setKycSubmitted] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [bankVerifying, setBankVerifying] = useState(false);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (field: keyof LocalKYCFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: keyof LocalKYCFormData, file: File | null) => {
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
      // Prepare KYC submission data
      const kycSubmission = {
        // Personal Info
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        
        // Contact Info
        email: formData.email,
        phone: formData.phone,
        
        // Address
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        
        // Identity
        panNumber: formData.panNumber,
        aadhaarNumber: formData.aadhaarNumber,
        
        // Bank Details
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        bankName: formData.bankName,
        
        // Income
        annualIncome: formData.annualIncome,
        occupation: formData.occupation,
        
        // Documents
        documents: {
          panCard: formData.panCard,
          aadhaarCard: formData.aadhaarCard,
          bankStatement: formData.bankStatement,
          photo: formData.photo
        }
      };
      
      // Submit KYC through service
      const result = await KYCService.submitKYC(kycSubmission);
      
      setVerificationId(result.verificationId);
      setKycSubmitted(true);
      
      toast({
        title: "KYC Submitted Successfully! 🎉",
        description: `Your verification ID is ${result.verificationId}. ${result.razorpayCustomerId ? 'Payment setup complete.' : ''}`,
        duration: 5000,
      });
      
      console.log('KYC submitted successfully:', {
        verificationId: result.verificationId,
        razorpayCustomerId: result.razorpayCustomerId
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'KYC submission failed. Please try again.';
      setError(errorMessage);
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
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
    field: keyof LocalKYCFormData;
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

  // Load KYC status on component mount
  useEffect(() => {
    const loadKYCStatus = async () => {
      try {
        const status = await KYCService.getKYCStatus();
        if (status) {
          setKycStatus(status);
          if (status.status === 'verified' || status.status === 'in_progress') {
            setKycSubmitted(true);
            setVerificationId(status.verificationId);
          }
        }
      } catch (error) {
        console.error('Failed to load KYC status:', error);
      }
    };
    
    loadKYCStatus();
  }, []);

  if (kycSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8 animate-fade-in-up">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <div className="animate-bounce mb-6">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-full shadow-lg mx-auto w-fit">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
          </div>
          
          <div className="space-y-4 animate-slide-up">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              KYC Submitted Successfully! 🎉
            </h1>
            <p className="text-gray-600 text-lg max-w-xl mx-auto">
              Your documents are under review. We'll notify you once the verification is complete.
            </p>
            
            {verificationId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-700 font-medium">Verification ID</p>
                <p className="text-xl font-bold text-blue-800">{verificationId}</p>
                <p className="text-xs text-blue-600 mt-1">Save this ID for future reference</p>
              </div>
            )}
          </div>
          
          <Card className="mt-8 max-w-md mx-auto">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">Review in Progress</p>
                    <p className="text-xs text-gray-600">Usually takes 24-48 hours</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">Email Updates</p>
                    <p className="text-xs text-gray-600">We'll keep you informed via email</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <IndianRupee className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">Ready to Invest</p>
                    <p className="text-xs text-gray-600">You can start investing once approved</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex gap-3 mt-8 justify-center">
            <Button 
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button 
              onClick={() => navigate('/invest')}
              variant="outline"
            >
              <Zap className="h-4 w-4 mr-2" />
              Explore Investments
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 animate-fade-in-up">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-8 animate-slide-down">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
              <Shield className="text-blue-600 animate-pulse" size={32} />
            </div>
            <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Complete Your KYC
            </h1>
          </div>
          <p className="text-muted-foreground text-lg mb-4 max-w-2xl mx-auto">
            Know Your Customer verification is required for regulatory compliance and secure investing
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

        <Card className="hover:shadow-xl transition-all duration-300 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className={`p-2 rounded-lg text-white ${
                currentStep === 1 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                currentStep === 2 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                currentStep === 3 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                'bg-gradient-to-r from-orange-500 to-orange-600'
              }`}>
                {currentStep === 1 && <User size={24} />}
                {currentStep === 2 && <MapPin size={24} />}
                {currentStep === 3 && <Building size={24} />}
                {currentStep === 4 && <Camera size={24} />}
              </div>
              
              <div>
                <span className="text-xl">
                  {currentStep === 1 && 'Personal Information'}
                  {currentStep === 2 && 'Address Details'}
                  {currentStep === 3 && 'Financial Information'}
                  {currentStep === 4 && 'Document Upload'}
                </span>
                <p className="text-sm text-gray-600 font-normal">
                  {currentStep === 1 && 'Tell us about yourself'}
                  {currentStep === 2 && 'Where do you live?'}
                  {currentStep === 3 && 'Your financial details'}
                  {currentStep === 4 && 'Upload required documents'}
                </p>
              </div>
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
                
                {/* Bank Account Verification */}
                {formData.accountNumber && formData.ifscCode && formData.bankName && (
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        setBankVerifying(true);
                        try {
                          const result = await KYCService.verifyBankAccount(
                            formData.accountNumber,
                            formData.ifscCode,
                            formData.fullName
                          );
                          if (result.success) {
                            toast({
                              title: "Bank Account Verified! ✅",
                              description: `Verified for ${result.accountHolderName}`,
                              duration: 3000,
                            });
                          }
                        } catch (error) {
                          console.error('Bank verification failed:', error);
                        } finally {
                          setBankVerifying(false);
                        }
                      }}
                      disabled={bankVerifying}
                      className="flex items-center gap-2"
                    >
                      {bankVerifying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Verify Bank Account
                        </>
                      )}
                    </Button>
                  </div>
                )}
                
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
            <div className="flex justify-between pt-6 border-t animate-fade-in-delay">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 hover:scale-105 transition-transform duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              
              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2 hover:scale-105 transition-all duration-200"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!validateStep(currentStep) || isLoading}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center gap-2 h-12 px-8 hover:scale-105 transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting KYC...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Submit for Verification
                    </>
                  )}
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
