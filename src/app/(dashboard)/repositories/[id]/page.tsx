import type { Metadata } from "next";
import { RepoDetailClient } from "./repo-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `${id.replace("repo_", "")} Analysis — IncidentPilot AI`,
    description: `Deployment risk prediction and code security history for ${id}.`,
  };
}

export default async function RepositoryDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <RepoDetailClient repoId={id} />;
}
