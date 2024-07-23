"use client";

import { api } from "@/trpc/react";
import Link from "next/link";

export function Teams() {
  const [teams] = api.team.list.useSuspenseQuery();

  return (
    <div className="w-full max-w-xs">
      {teams && teams.length !== 0 ? (
        <p className="truncate">
          Your teams:{" "}
          {teams.map((team) => (
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href={`/t/${team.id}`}
              key={team.id}
            >
              <h3 className="text-2xl font-bold">{team.name} →</h3>
              <div className="text-lg">
                {team.projects.length} projects in this team.
              </div>
            </Link>
          ))}
        </p>
      ) : (
        <p>You have no teams yet.</p>
      )}
    </div>
  );
}
