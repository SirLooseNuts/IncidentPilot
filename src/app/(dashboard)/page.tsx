import type { Metadata } from "next";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard — IncidentPilot AI",
  description: "Command center for autonomous software reliability engineering.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
