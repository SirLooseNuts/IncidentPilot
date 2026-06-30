"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitFork,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  Activity,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

const mainNav = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Repositories", href: "/repositories", icon: GitFork },
  { label: "Incidents", href: "/incidents", icon: AlertTriangle },
  { label: "Analyze", href: "/analyze", icon: Clipboard },
];

const intelligenceNav = [
  { label: "Predictions", href: "/predictions", icon: TrendingUp },
  { label: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
];

const systemNav = [
  { label: "AI Activity", href: "/ai-activity", icon: Activity },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const NavItem = ({
    item,
  }: {
    item: { label: string; href: string; icon: React.ComponentType<{ className?: string }> };
  }) => {
    const active = isActive(item.href);
    const Icon = item.icon;

    const linkContent = (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
          active
            ? "bg-primary/10 text-primary border-l-2 border-primary"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground border-l-2 border-transparent"
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "")} />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger className="w-full">{linkContent}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Shield className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
              IncidentPilot
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              AI Platform
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {/* Main */}
        {!collapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Main
          </p>
        )}
        <div className="space-y-0.5">
          {mainNav.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>

        <Separator className="my-4 bg-sidebar-border" />

        {/* Intelligence */}
        {!collapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Intelligence
          </p>
        )}
        <div className="space-y-0.5">
          {intelligenceNav.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>

        <Separator className="my-4 bg-sidebar-border" />

        {/* System */}
        {!collapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            System
          </p>
        )}
        <div className="space-y-0.5">
          {systemNav.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>
      </div>

      {/* Active incidents badge */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <div
          className={cn(
            "flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2",
            collapsed && "justify-center px-2"
          )}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-severity-critical opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-severity-critical" />
          </span>
          {!collapsed && (
            <span className="text-xs font-medium text-severity-critical">
              3 Active Incidents
            </span>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
