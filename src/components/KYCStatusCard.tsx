import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  CreditCard,
  ArrowRight,
  Zap,
  Info
} from 'lucide-react';
import KYCService from '@/lib/kyc-service';

interface KYCStatusCardProps {
  className?: string;
  showFullDetails?: boolean;
}

const KYCStatusCard: React.FC<KYCStatusCardProps> = ({ 
  className = '', 
  showFullDetails = false 
}) => {
  const navigate = useNavigate();
  const [complianceStatus, setComplianceStatus] = useState<{
    isCompliant: boolean;
    kycStatus: string;
    pendingActions: string[];
    nextSteps: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadComplianceStatus = async () => {
      try {
        const status = await KYCService.getComplianceStatus();
        setComplianceStatus(status);
      } catch (error) {
        console.error('Failed to load compliance status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadComplianceStatus();
  }, []);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!complianceStatus) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-gray-500">
            <Info className="h-4 w-4" />
            <span>Unable to load KYC status</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    switch (complianceStatus.kycStatus) {
      case 'verified':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'rejected':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    if (complianceStatus.isCompliant) return 'bg-green-100 text-green-800';
    switch (complianceStatus.kycStatus) {
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (complianceStatus.kycStatus) {
      case 'verified':
        return 'KYC Verified';
      case 'in_progress':
        return 'KYC In Progress';
      case 'rejected':
        return 'KYC Rejected';
      case 'not_started':
        return 'KYC Required';
      default:
        return 'KYC Pending';
    }
  };

  const getProgressPercentage = () => {
    switch (complianceStatus.kycStatus) {
      case 'verified':
        return 100;
      case 'in_progress':
        return 75;
      case 'rejected':
        return 25;
      default:
        return 0;
    }
  };

  return (
    <Card className={`${className} hover:shadow-lg transition-shadow duration-300`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <span className="text-lg">KYC Compliance</span>
          </div>
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </CardTitle>
        
        {!complianceStatus.isCompliant && (
          <div className="mt-2">
            <Progress 
              value={getProgressPercentage()} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {getProgressPercentage()}% complete
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {complianceStatus.isCompliant ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Fully Compliant</p>
                <p className="text-sm text-green-700">
                  You can invest without limits
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  All payment methods available
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/invest')}
                className="text-green-600 hover:text-green-700"
              >
                Start Investing
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {complianceStatus.pendingActions.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2 text-orange-900">
                  Pending Actions:
                </h4>
                <ul className="space-y-1">
                  {complianceStatus.pendingActions.map((action, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                      <span className="text-muted-foreground">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {showFullDetails && complianceStatus.nextSteps.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Next Steps:</h4>
                <ul className="space-y-1">
                  {complianceStatus.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Alert className="border-orange-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {complianceStatus.kycStatus === 'not_started' ? (
                  'Complete KYC to unlock full investment features and higher limits.'
                ) : complianceStatus.kycStatus === 'rejected' ? (
                  'Your KYC was rejected. Please resubmit with correct documents.'
                ) : (
                  'Your KYC is being verified. This usually takes 24-48 hours.'
                )}
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 pt-2">
              {complianceStatus.kycStatus === 'not_started' || 
               complianceStatus.kycStatus === 'rejected' ? (
                <Button
                  onClick={() => navigate('/kyc')}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Complete KYC
                </Button>
              ) : (
                <Button variant="outline" className="flex-1" disabled>
                  <Clock className="h-4 w-4 mr-2" />
                  Under Review
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/invest')}
                className="px-3"
              >
                <Zap className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Investment Limits Info */}
        {!complianceStatus.isCompliant && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-muted-foreground">
              Without KYC: Max ₹5,000 per transaction, ₹10,000 annual limit
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KYCStatusCard;
