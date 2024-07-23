"use client";

import { api } from "@/trpc/react";

export function Teams() {
  const [teams] = api.team.list.useSuspenseQuery();

  return (
    <div className="w-full max-w-xs">
      {teams ? (
        <p className="truncate">
          Your teams:{" "}
          {teams.map((team) => (
            <>{team.name}</>
          ))}
        </p>
      ) : (
        <p>You have no teams yet.</p>
      )}
    </div>
  );
}
