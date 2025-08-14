import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Filter, ArrowUpRight, ArrowDownRight, Search, Wallet, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const filters = ["All", "Round-Ups", "Investments"];

const transactions = [
  {
    id: 1,
    type: "roundup",
    merchant: "Swiggy",
    amount: "₹298",
    roundUp: "₹2",
    date: "Today, 2:30 PM",
    category: "Food & Dining",
    icon: ShoppingCart
  },
  {
    id: 2,
    type: "investment",
    merchant: "Gold ETF Purchase",
    amount: "₹500",
    roundUp: null,
    date: "Today, 10:00 AM",
    category: "Investment",
    icon: Wallet
  },
  {
    id: 3,
    type: "roundup",
    merchant: "Uber",
    amount: "₹145",
    roundUp: "₹5",
    date: "Yesterday, 8:15 PM",
    category: "Transportation",
    icon: ArrowUpRight
  },
  {
    id: 4,
    type: "roundup",
    merchant: "Amazon",
    amount: "₹1,247",
    roundUp: "₹3",
    date: "Yesterday, 3:45 PM",
    category: "Shopping",
    icon: ShoppingCart
  },
  {
    id: 5,
    type: "investment",
    merchant: "Index Fund Purchase",
    amount: "₹1,000",
    roundUp: null,
    date: "2 days ago",
    category: "Investment",
    icon: Wallet
  },
  {
    id: 6,
    type: "roundup",
    merchant: "Zomato",
    amount: "₹247",
    roundUp: "₹3",
    date: "3 days ago, 7:20 PM",
    category: "Food & Dining",
    icon: ShoppingCart
  },
];

const HistoryPage = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = (() => {
      if (activeFilter === "All") return true;
      if (activeFilter === "Round-Ups") return transaction.type === "roundup";
      if (activeFilter === "Investments") return transaction.type === "investment";
      return true;
    })();
    
    const matchesSearch = transaction.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const totalRoundUps = transactions.filter(t => t.type === "roundup").length;
  const totalInvestments = transactions.filter(t => t.type === "investment").length;

  return (
    <div className="container-mobile xl:container xl:py-8">
      {/* Header */}
      <div className="text-center xl:text-left mb-6">
        <h1 className="text-2xl xl:text-4xl font-heading font-semibold mb-2">Transaction History</h1>
        <p className="text-muted-foreground xl:text-lg">Track all your round-ups and investments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-card">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Round-Ups</p>
            <p className="text-xl font-heading font-semibold text-primary">₹485</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">This Month</p>
            <p className="text-xl font-heading font-semibold text-secondary">₹125</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card xl:block hidden">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Investments</p>
            <p className="text-xl font-heading font-semibold text-accent">₹11,200</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card xl:block hidden">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Growth</p>
            <p className="text-xl font-heading font-semibold text-success">+12.5%</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-xl"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {filters.map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "rounded-full",
              activeFilter === filter && "bg-primary text-primary-foreground"
            )}
          >
            {filter}
          </Button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredTransactions.map((transaction) => (
          <Card key={transaction.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    transaction.type === "investment" 
                      ? "bg-secondary-light text-secondary" 
                      : "bg-primary-light text-primary"
                  )}>
                    {transaction.type === "investment" ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownRight size={16} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.merchant}</p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{transaction.amount}</p>
                  {transaction.roundUp && (
                    <div className="round-up-badge mt-1">
                      +{transaction.roundUp}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <Button variant="outline" className="w-full mt-6">
        Load More Transactions
      </Button>
    </div>
  );
};

export default HistoryPage;