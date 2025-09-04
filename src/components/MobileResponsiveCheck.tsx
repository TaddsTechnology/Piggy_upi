import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Monitor } from 'lucide-react';

const MobileResponsiveCheck = () => {
  const isMobile = useIsMobile();

  return (
    <Card className="fixed top-4 right-4 z-50 w-64 shadow-lg border-2 bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {isMobile ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
          Responsive Status
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">Device Type:</span>
          <Badge variant={isMobile ? "default" : "secondary"}>
            {isMobile ? "Mobile" : "Desktop"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Screen Width:</span>
          <Badge variant="outline" className="text-xs">
            {typeof window !== 'undefined' ? `${window.innerWidth}px` : 'Unknown'}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          Breakpoint: {isMobile ? "< 768px" : "≥ 768px"}
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileResponsiveCheck;
