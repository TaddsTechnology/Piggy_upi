import { Shield, Lock } from "lucide-react";

const TrustBadge = () => {
  return (
    <div className="container-mobile">
      <div className="trust-badge mb-4">
        <Shield size={16} />
        <span>Secured by RBI & SEBI partners</span>
        <Lock size={14} className="opacity-70" />
      </div>
    </div>
  );
};

export default TrustBadge;