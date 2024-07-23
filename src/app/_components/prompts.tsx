"use client";

import { api } from "@/trpc/react";
import Link from "next/link";

export function Prompts({
  teamId,
  projectId,
}: {
  teamId: string;
  projectId: string;
}) {
  const [prompts] = api.prompt.list.useSuspenseQuery({ projectId });

  return (
    <div className="w-full max-w-xs">
      {prompts ? (
        <p className="truncate">
          Your prompts:
          {prompts.map((prompt) => (
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href={`/t/${teamId}/p/${projectId}/p/${prompt.id}`}
              key={prompt.id}
            >
              <h3 className="text-2xl font-bold">{prompt.name} →</h3>
              <div className="text-lg">Currently {prompt.status}</div>
            </Link>
          ))}
        </p>
      ) : (
        <p>You have no prompts yet.</p>
      )}
    </div>
  );
}
