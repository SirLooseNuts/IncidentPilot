import type { Metadata } from "next";
import { IncidentDetailClient } from "./incident-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `${id} — IncidentPilot AI`,
    description: `Root cause analysis and autonomous fix for incident ${id}.`,
  };
}

export default async function IncidentDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <IncidentDetailClient incidentId={id} />;
}
