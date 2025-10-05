"use client";

import React, { FC } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCreatorSidebar } from "@/store/use-creator-sidebar";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavItem: FC<NavItemProps> = ({ 
  icon: Icon, 
  isActive = false, 
  label, 
  href, 
  onClick 
}) => {
  const { collapsed } = useCreatorSidebar();

  return (
    <li>
      {onClick ? (
        <Button
          onClick={onClick}
          variant="ghost"
          className={cn(
            "w-full h-12 justify-start",
            collapsed && "justify-center",
            isActive && "bg-accent"
          )}
          aria-pressed={isActive}
        >
          <div className="flex items-center gap-x-2">
            <Icon className="h-5 w-5" />
            {!collapsed && <span>{label}</span>}
          </div>
        </Button>
      ) : (
        <Button
          asChild
          variant="ghost"
          className={cn(
            "w-full h-12 justify-start",
            collapsed && "justify-center",
            isActive && "bg-accent"
          )}
        >
          <Link href={href || "#"} aria-current={isActive ? "page" : undefined}>
            <div className="flex items-center gap-x-2">
              <Icon className="h-5 w-5" />
              {!collapsed && <span>{label}</span>}
            </div>
          </Link>
        </Button>
      )}
    </li>
  );
};

export default NavItem;

export const NavItemSkeleton = () => (
  <li className="px-3 py-2">
    <Skeleton className="h-12 w-full rounded-md" />
  </li>
);