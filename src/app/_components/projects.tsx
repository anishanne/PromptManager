"use client";

import { api } from "@/trpc/react";

export function Project({ teamId }: { teamId: string }) {
  const [projects] = api.project.list.useSuspenseQuery({ teamId });

  return (
    <div className="w-full max-w-xs">
      {projects ? (
        <p className="truncate">
          Your project lst: {projects.map((project) => project.name).join(", ")}
        </p>
      ) : (
        <p>You have no projects yet.</p>
      )}
    </div>
  );
}
