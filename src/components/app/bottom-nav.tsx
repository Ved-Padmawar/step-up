"use client";

import {
  ChartBar,
  Footprints,
  PlusCircle,
  ShieldStar,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

import { cn } from "@/lib/cn";

type BottomNavProps = {
  isAdmin: boolean;
};

type NavLink = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string; weight?: "regular" | "fill" }>;
  adminOnly?: boolean;
};

const links: NavLink[] = [
  { href: "/activities", label: "Activities", icon: Footprints },
  { href: "/log", label: "Log", icon: PlusCircle },
  { href: "/leaderboard", label: "Board", icon: ChartBar },
  { href: "/admin", label: "Admin", icon: ShieldStar, adminOnly: true },
];

export function BottomNav({ isAdmin }: BottomNavProps) {
  const pathname = usePathname();
  const visibleLinks = links.filter((link) => !link.adminOnly || isAdmin);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-black/5 bg-surface/95 backdrop-blur">
      <div
        className={cn(
          "mx-auto grid max-w-3xl gap-1 px-2 py-1.5",
          visibleLinks.length === 4 ? "grid-cols-4" : "grid-cols-3",
        )}
      >
        {visibleLinks.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-center text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                active
                  ? "font-semibold shadow-sm"
                  : "text-muted hover:bg-brand/10 hover:text-brand",
              )}
              data-active={active ? "" : undefined}
              data-slot="bottom-nav-link"
              href={link.href}
              key={link.href}
            >
              <Icon
                aria-hidden="true"
                className="size-5"
                weight={active ? "fill" : "regular"}
              />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
