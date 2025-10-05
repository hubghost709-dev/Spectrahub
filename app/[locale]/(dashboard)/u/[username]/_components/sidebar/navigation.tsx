"use client";

import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import {
  Fullscreen,
  KeyRound,
  MessageSquare,
  Users,
  UserCheck,
  ShieldCheck,
  Settings,
  Loader
} from "lucide-react";
import NavItem from "./nav-item";
import { useEffect, useState, useCallback } from "react";
import { VerifyModal } from "./verify-modal";
import { useTranslations } from "next-intl";

interface UserData {
  id: string;
  username: string;
  isVerifiedModel: boolean;
}

function Navigation() {
  const t = useTranslations(); // Hook de next-intl
  const pathname = usePathname();
  const { user, isLoaded: clerkLoaded } = useUser();
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${user.id}`);

      if (!response.ok) throw new Error(t("errorLoadingData"));

      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, t]);

  useEffect(() => {
    if (user?.id) fetchUserData();
  }, [user?.id, fetchUserData]);

  const handleVerificationSuccess = () => {
    fetchUserData();
    setShowVerifyModal(false);
  };

  if (!clerkLoaded || isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader className="animate-spin h-5 w-5" />
      </div>
    );
  }

  if (!user?.username || isLoading) {
    return (
      <ul className="space-y-2 px-2 pt-4 lg:pt-0">
        {[...Array(4)].map((_, i) => (
          <NavItem key={i} icon={Users} label="" />
        ))}
      </ul>
    );
  }

  const routes = [
    {
      label: t("stream"),
      href: `/u/${user.username}`,
      icon: Fullscreen,
      requiresVerification: true
    },
    {
      label: t("keys"),
      href: `/u/${user.username}/keys`,
      icon: KeyRound,
      requiresVerification: true
    },
    {
      label: t("chat"),
      href: `/u/${user.username}/chat`,
      icon: MessageSquare,
      requiresVerification: false
    },
    {
      label: t("community"),
      href: `/u/${user.username}/community`,
      icon: Users,
      requiresVerification: false
    },
    {
      label: t("mySettings"),
      href: `/u/${user.username}/settings`,
      icon: Settings,
      requiresVerification: true
    }
  ];

  return (
    <>
      <ul className="space-y-2 px-2 pt-4 lg:pt-0">
        {routes.map((route) => {
          if (route.requiresVerification && !userData?.isVerifiedModel) {
            return null;
          }

          return (
            <NavItem
              key={route.label}
              label={route.label}
              icon={route.icon}
              href={route.href}
              isActive={pathname === route.href}
            />
          );
        })}

        {!userData?.isVerifiedModel && (
          <NavItem
            label={t("becomeAModel")}
            icon={UserCheck}
            onClick={() => setShowVerifyModal(true)}
          />
        )}

        {userData?.isVerifiedModel && (
          <div className="flex items-center gap-x-2 p-4 text-green-500">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-sm hidden lg:block">{t("verifiedModel")}</span>
          </div>
        )}
      </ul>

      <VerifyModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onSuccess={handleVerificationSuccess}
      />
    </>
  );
}

export default Navigation;