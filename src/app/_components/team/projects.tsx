"use client";

import { api } from "@/trpc/react";
import Link from "next/link";
import CreateProject from "@/app/_components/team/createProject";
import UpdateTeam from "@/app/_components/team/updateTeam";
import { useState } from "react";

export function Projects({ teamId, user }: { teamId: string; user: { id: string } }) {
	const [team] = api.team.get.useSuspenseQuery({ teamId });
	const [openCreate, setOpenCreate] = useState(false);
	const [openUpdate, setOpenUpdate] = useState(false);

	return (
		<div className="w-full text-center">
			<h1 className="mb-2 text-5xl font-extrabold tracking-tight sm:text-[5rem]">Team: {team.name}</h1>
			<p className="mb-4 text-lg">Your permission level: {team?.permission}</p>
			{team?.projects && team?.projects.length > 0 ? (
				<div className="w-full">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8 lg:grid-cols-4">
						{team.projects.map((project) => (
							<Link
								className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
								href={`/t/${teamId}/p/${project.id}`}
								key={project.id}>
								<h3 className="text-2xl font-bold">{project.name} →</h3>
								<div className="text-lg">{project?.prompts?.length} prompts in this project.</div>
							</Link>
						))}
					</div>
				</div>
			) : (
				<p className="text-lg">This team has no projects yet.</p>
			)}
			{["ADMIN", "MANAGER"].includes(team.permission) && (
				<>
					<div>
						<button
							onClick={() => {
								setOpenCreate(true);
							}}
							className="mt-4 rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">
							Create A Project
						</button>
						<button
							onClick={() => {
								setOpenUpdate(true);
							}}
							className="ml-4 mt-4 rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">
							Update Team
						</button>
					</div>
					<CreateProject open={openCreate} setOpen={setOpenCreate} teamId={teamId} />
					<UpdateTeam open={openUpdate} setOpen={setOpenUpdate} team={team} user={user} />
				</>
			)}
		</div>
	);
}
