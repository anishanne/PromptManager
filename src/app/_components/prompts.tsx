"use client";

import { api } from "@/trpc/react";

export function Prompts({ projectId }: { projectId: string }) {
  const [prompts] = api.prompt.get.useSuspenseQuery({ projectId });

  return (
    <div className="w-full max-w-xs">
      {prompts ? (
        <p className="truncate">
          Your prompts:{" "}
          {prompts.map((prompt) => (
            <>{prompt.name}</>
          ))}
        </p>
      ) : (
        <p>You have no prompts yet.</p>
      )}
    </div>
  );
}
