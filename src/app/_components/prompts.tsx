"use client";

import { api } from "@/trpc/react";
import Link from "next/link";
import CreatePrompt from "./createPrompt";
import { useState } from "react";
import UpdateProject from "./updateProject";

export function Prompts({
  teamId,
  projectId,
}: {
  teamId: string;
  projectId: string;
}) {
  const [project] = api.project.get.useSuspenseQuery({ id: projectId });
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);

  return (
    <div className="w-full max-w-lg text-center">
      <h1 className="mb-4 text-5xl font-extrabold tracking-tight">
        Project: {project?.name}
      </h1>
      {project?.prompts && project?.prompts.length > 0 ? (
        <div className="w-full">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            {project.prompts.map((prompt) => (
              <Link
                className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
                href={`/t/${teamId}/p/${projectId}/${prompt.id}`}
                key={prompt.id}
              >
                <h3 className="text-2xl font-bold">{prompt.name} →</h3>
                <div className="text-lg">This is a fire prompt.</div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-lg">This project has no prompts yet.</p>
      )}
      <div>
        <button
          onClick={() => {
            setOpenCreate(true);
          }}
          className="mt-4 rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
        >
          Create A Prompt
        </button>
        <button
          onClick={() => {
            setOpenUpdate(true);
          }}
          className="ml-4 mt-4 rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
        >
          Update Project
        </button>
      </div>
      <CreatePrompt
        open={openCreate}
        setOpen={setOpenCreate}
        projectId={projectId}
      />
      <UpdateProject
        open={openUpdate}
        setOpen={setOpenUpdate}
        project={project}
      />
    </div>
  );
}
