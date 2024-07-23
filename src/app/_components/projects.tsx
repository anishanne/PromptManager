"use client";

import { api } from "@/trpc/react";
import Link from "next/link";

export function Project({ teamId }: { teamId: string }) {
  const [projects] = api.project.list.useSuspenseQuery({ teamId });

  return (
    <div className="w-full max-w-xs">
      {projects ? (
        <p className="truncate">
          Your project lst:
          {projects.map((project) => (
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href={`/t/${teamId}/p/${project.id}`}
              key={project.id}
            >
              <h3 className="text-2xl font-bold">{project.name} →</h3>
              <div className="text-lg">
                {project.prompts.length} prompts in this project.
              </div>
            </Link>
          ))}
        </p>
      ) : (
        <p>You have no projects yet.</p>
      )}
    </div>
  );
}
