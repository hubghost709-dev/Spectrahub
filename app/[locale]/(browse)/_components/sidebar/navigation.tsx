
"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import NavItem from "./nav-item";
import { ComplianceModal } from "@/components/compliance-modal";

function Navigation() {
  const [showComplianceModal, setShowComplianceModal] = useState(false);

  return (
    <div className="pt-4 mt-4 border-t border-[#2D2E35] px-2">
      <NavItem
        label="18 U.S.C. 2257 Compliance"
        icon={FileText}
        onClick={() => setShowComplianceModal(true)}
      />
      
      <ComplianceModal
        isOpen={showComplianceModal}
        onClose={() => setShowComplianceModal(false)}
      />
    </div>
  );
}

export default Navigation;

