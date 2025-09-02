import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  CreditCard,
  Zap,
  Pause,
  Play,
  Trash2,
  Calendar,
  IndianRupee,
  Smartphone,
  History
} from 'lucide-react';
import UPIAutopayService, { UPIMandateRequest, AutopayExecution } from '@/lib/upi-autopay-service';

interface AutopayManagementProps {
  onSetupNew?: () => void;
}

const AutopayManagement: React.FC<AutopayManagementProps> = ({ onSetupNew }) => {
  const [mandates, setMandates] = useState<UPIMandateRequest[]>([]);
  const [executions, setExecutions] = useState<AutopayExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMandate, setSelectedMandate] = useState<string | null>(null);

  useEffect(() => {
    loadMandatesAndHistory();
  }, []);

  const loadMandatesAndHistory = () => {
    try {
      const activeMandates = UPIAutopayService.getActiveMandates();
      const autopayHistory = UPIAutopayService.getAutopayHistory();
      
      setMandates(activeMandates);
      setExecutions(autopayHistory);
    } catch (error) {
      console.error('Failed to load autopay data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAutopay = async (mandateId: string) => {
    try {
      const success = await UPIAutopayService.cancelAutopay(mandateId);
      if (success) {
        // Reload data after cancellation
        loadMandatesAndHistory();
      }
    } catch (error) {
      console.error('Failed to cancel autopay:', error);
    }
  };

  const handleExecutePayment = async (mandateId: string, amount: number) => {
    try {
      await UPIAutopayService.executeAutopayment(mandateId, amount, 'Manual investment via autopay');
      // Reload history after execution
      loadMandatesAndHistory();
    } catch (error) {
      console.error('Failed to execute payment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExecutionStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'insufficient_funds': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Mandates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-blue-600" />
              <span>UPI Autopay Mandates</span>
            </div>
            {mandates.length === 0 && (
              <Button onClick={onSetupNew} size="sm">
                Setup Autopay
              </Button>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {mandates.length === 0 ? (
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                No active autopay mandates found. Set up UPI autopay to enable automatic investments.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {mandates.map((mandate) => (
                <div key={mandate.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{mandate.upiId}</p>
                        <p className="text-sm text-muted-foreground">
                          {mandate.description}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(mandate.status)}>
                      {mandate.status === 'approved' ? 'Active' : mandate.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Max Amount</p>
                      <p className="font-medium">₹{mandate.maxAmount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Frequency</p>
                      <p className="font-medium capitalize">{mandate.frequency}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Valid Until</p>
                      <p className="font-medium">{formatDate(mandate.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="font-medium">{formatDate(mandate.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExecutePayment(mandate.id, 100)}
                      disabled={mandate.status !== 'approved'}
                    >
                      <IndianRupee className="h-4 w-4 mr-1" />
                      Pay ₹100
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExecutePayment(mandate.id, 500)}
                      disabled={mandate.status !== 'approved'}
                    >
                      <IndianRupee className="h-4 w-4 mr-1" />
                      Pay ₹500
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedMandate(
                        selectedMandate === mandate.id ? null : mandate.id
                      )}
                    >
                      <History className="h-4 w-4 mr-1" />
                      History
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleCancelAutopay(mandate.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>

                  {/* Execution History for this mandate */}
                  {selectedMandate === mandate.id && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Payment History
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {executions
                          .filter(exec => exec.mandateId === mandate.id)
                          .map((execution) => (
                            <div key={execution.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <p className="text-sm font-medium">₹{execution.amount}</p>
                                <p className="text-xs text-muted-foreground">
                                  {execution.executedAt.toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-medium ${getExecutionStatusColor(execution.status)}`}>
                                  {execution.status === 'success' ? 'Success' : 
                                   execution.status === 'failed' ? 'Failed' : 
                                   'Pending'}
                                </span>
                                {execution.status === 'success' && (
                                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                                )}
                                {execution.status === 'failed' && (
                                  <AlertTriangle className="h-3 w-3 text-red-600" />
                                )}
                              </div>
                            </div>
                          ))}
                        {executions.filter(exec => exec.mandateId === mandate.id).length === 0 && (
                          <p className="text-sm text-muted-foreground">No payments executed yet</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overall Statistics */}
      {mandates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Mandates</p>
                  <p className="text-xl font-bold">{mandates.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <IndianRupee className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                  <p className="text-xl font-bold">
                    ₹{executions
                      .filter(exec => exec.status === 'success')
                      .reduce((sum, exec) => sum + exec.amount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-xl font-bold">{executions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Transactions */}
      {executions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <History className="h-5 w-5 text-purple-600" />
              <span>Recent Autopay Transactions</span>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {executions
                .slice(0, 5) // Show only last 5 transactions
                .map((execution) => (
                  <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        execution.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {execution.status === 'success' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">₹{execution.amount}</p>
                        <p className="text-sm text-muted-foreground">
                          {execution.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getExecutionStatusColor(execution.status)}`}>
                        {execution.status === 'success' ? 'Completed' : 'Failed'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {execution.executedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutopayManagement;
