import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Smartphone, Monitor, Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const MobileAuthDemo = () => {
  const isMobile = useIsMobile();

  const improvements = [
    "✅ Mobile-first responsive layout",
    "✅ Touch-friendly button sizes (44px+)",
    "✅ iOS zoom prevention (16px font)",
    "✅ Better form spacing on mobile",
    "✅ Stacked elements on small screens",
    "✅ Mobile header with logo",
    "✅ Enhanced tap targets",
    "✅ Keyboard handling improvements"
  ];

  return (
    <Card className="w-full max-w-md mx-auto mt-4 border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          {isMobile ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
          Auth Page - Mobile Ready! 🎉
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Current View:</span>
          <Badge variant={isMobile ? "default" : "secondary"}>
            {isMobile ? "Mobile" : "Desktop"}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-green-800">Mobile Improvements:</h4>
          <div className="text-xs space-y-1">
            {improvements.map((improvement, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{improvement.replace("✅ ", "")}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-3 border-t border-green-200">
          <p className="text-xs text-green-700">
            Try resizing your browser or testing on a mobile device to see the responsive design in action!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileAuthDemo;
