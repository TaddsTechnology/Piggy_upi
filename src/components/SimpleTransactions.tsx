import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowDown,
  ArrowUp,
  Filter,
  Search,
  PiggyBank,
  ShoppingCart,
  Coffee,
  Utensils,
  Car,
  Smartphone,
  Film,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  amount: number;
  merchant: string;
  category: string;
  roundup: number;
}

interface SimpleTransactionsProps {
  transactions: Transaction[];
  totalRoundups: number;
  onSimulateTransaction?: () => void;
}

const SimpleTransactions = ({ 
  transactions, 
  totalRoundups,
  onSimulateTransaction 
}: SimpleTransactionsProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const itemsPerPage = 10;

  // Get the category icon based on transaction
  const getCategoryIcon = (category: string) => {
    switch(category.toLowerCase()) {
      case 'food':
        return <Utensils className="h-4 w-4" />;
      case 'coffee':
        return <Coffee className="h-4 w-4" />;
      case 'transport':
        return <Car className="h-4 w-4" />;
      case 'shopping':
        return <ShoppingCart className="h-4 w-4" />;
      case 'entertainment':
        return <Film className="h-4 w-4" />;
      case 'tech':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <ShoppingCart className="h-4 w-4" />;
    }
  };

  // Filter transactions
  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.category.toLowerCase() === filter.toLowerCase());

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  // Format date to human-readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  // Get merchant logo placeholder (first letter)
  const getMerchantLogo = (merchant: string) => {
    return merchant.charAt(0).toUpperCase();
  };

  // Handle page navigation
  const goToPage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6 pt-4">
        
        {/* Header with Summary */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Your Round-Ups 💰
          </h1>
          <p className="text-gray-600">
            See how your small change is adding up!
          </p>
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <PiggyBank className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Total saved from round-ups</p>
                  <p className="text-2xl font-bold">₹{totalRoundups.toLocaleString('en-IN')}</p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={onSimulateTransaction}
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs and Filters */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="all" onValueChange={setFilter}>
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Transactions</TabsTrigger>
                  <TabsTrigger value="food">Food</TabsTrigger>
                  <TabsTrigger value="shopping">Shopping</TabsTrigger>
                  <TabsTrigger value="transport">Transport</TabsTrigger>
                </TabsList>
                
                {onSimulateTransaction && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onSimulateTransaction}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Demo Transaction
                  </Button>
                )}
              </div>

              {/* Transaction List */}
              <TabsContent value={filter} className="space-y-1 mt-2">
                {paginatedTransactions.length > 0 ? (
                  <>
                    {paginatedTransactions.map((transaction) => (
                      <div 
                        key={transaction.id}
                        className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-medium">
                            {getMerchantLogo(transaction.merchant)}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{transaction.merchant}</p>
                              <Badge 
                                variant="outline" 
                                className="text-xs flex items-center gap-1"
                              >
                                {getCategoryIcon(transaction.category)}
                                {transaction.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-medium">₹{transaction.amount.toFixed(2)}</div>
                          <div className="flex items-center justify-end">
                            <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                              <ArrowUp className="h-3 w-3" />
                              +₹{transaction.roundup.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Simple Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        
                        <span className="text-sm text-gray-500">
                          Page {currentPage} of {totalPages}
                        </span>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <ShoppingCart className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">No transactions yet</h3>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto">
                      When you make purchases, we'll round up and save the spare change.
                    </p>
                    
                    {onSimulateTransaction && (
                      <Button 
                        onClick={onSimulateTransaction}
                        className="mt-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Demo Transaction
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-yellow-500 text-white p-2 rounded-full flex-shrink-0">
                <PiggyBank className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium text-sm mb-1">How does this work?</h3>
                <p className="text-xs text-gray-600">
                  When you spend ₹127, we round it up to ₹130 and save the ₹3 difference.
                  These small amounts add up and get invested automatically!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleTransactions;
