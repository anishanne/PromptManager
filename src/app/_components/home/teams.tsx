"use client";

import { api } from "@/trpc/react";
import Link from "next/link";
import CreateTeam from "@/app/_components/home/createTeam";
import { useState } from "react";

export function Teams() {
	const [teams] = api.team.list.useSuspenseQuery();
	const [open, setOpen] = useState(false);

	return (
		<div>
			{teams && teams.length !== 0 ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
					{teams.map((team) => (
						<Link
							className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
							href={`/t/${team.id}`}
							key={team.id}>
							<h3 className="text-2xl font-bold">{team.name} →</h3>
							<div className="text-lg">{team.projects.length} projects in this team.</div>
						</Link>
					))}
				</div>
			) : (
				<p className="text-center text-lg">You have no teams yet.</p>
			)}
			<button
				onClick={() => {
					setOpen(true);
				}}
				className="mt-4 rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">
				Create A Team
			</button>
			<CreateTeam open={open} setOpen={setOpen} />
		</div>
	);
}
