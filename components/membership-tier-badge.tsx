
/**
 * Membership Tier Badge Component
 * 
 * Displays user's current BARRELS membership tier with styling
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Target } from "lucide-react";

interface MembershipTierBadgeProps {
  tier: string;
  status?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function MembershipTierBadge({
  tier,
  status = "active",
  showIcon = true,
  size = "md",
}: MembershipTierBadgeProps) {
  const getTierConfig = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "elite":
        return {
          label: "BARRELS Elite",
          color: "bg-gradient-to-r from-purple-600 to-pink-600",
          icon: Crown,
          textColor: "text-white",
        };
      case "pro":
        return {
          label: "BARRELS Pro",
          color: "bg-gradient-to-r from-orange-600 to-cyan-600",
          icon: Zap,
          textColor: "text-white",
        };
      case "athlete":
        return {
          label: "BARRELS Athlete",
          color: "bg-gradient-to-r from-green-600 to-teal-600",
          icon: Target,
          textColor: "text-white",
        };
      default:
        return {
          label: "Free",
          color: "bg-gray-700",
          icon: Target,
          textColor: "text-gray-300",
        };
    }
  };

  const config = getTierConfig(tier);
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  };

  const isInactive = status !== "active";

  return (
    <div
      className={`
        ${config.color} 
        ${sizeClasses[size]} 
        ${config.textColor}
        ${isInactive ? "opacity-50" : ""}
        inline-flex items-center gap-2 rounded-full font-semibold
        shadow-lg
      `}
    >
      {showIcon && <Icon className="w-4 h-4" />}
      {config.label}
      {isInactive && (
        <span className="text-xs opacity-75">(Inactive)</span>
      )}
    </div>
  );
}
