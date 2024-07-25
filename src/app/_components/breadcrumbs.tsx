"use client";

import { HomeIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/trpc/react";
import { useEffect, useState } from "react";

export default function Breadcrumbs() {
	const pathname = usePathname();

	const [teamId, setTeamId] = useState("");
	const [projectId, setProjectId] = useState("");
	const [promptId, setPromptId] = useState("");
	const [pieces, setPieces] = useState<{ name: string; url: string }[]>([]);

	const { data: team } = api.team.get.useQuery({ teamId }, { enabled: !!teamId });
	const { data: project } = api.project.get.useQuery({ id: projectId }, { enabled: !!projectId });
	const { data: prompt } = api.prompt.get.useQuery({ promptId }, { enabled: !!promptId });

	useEffect(() => {
		const parts = pathname.split("/").filter((p) => p !== "");
		const newPieces = [];

		if (parts[0] == "t" && parts[1]) {
			setTeamId(parts[1]);
			if (team) newPieces.push({ name: `Team: ${team.name}`, url: `/t/${parts[1]}` });
		}
		if (parts[2] == "p" && parts[3]) {
			setProjectId(parts[3]);
			if (project) newPieces.push({ name: `Project: ${project.name}`, url: `/t/${parts[1]}/p/${parts[3]}` });

			if (parts[4]) {
				setPromptId(parts[4]);
				if (prompt) newPieces.push({ name: `Prompt: ${prompt.name}`, url: `/t/${parts[1]}/p/${parts[3]}/${parts[4]}` });
			}
		}
		setPieces(newPieces);
	}, [pathname, team, project, prompt]);

	return (
		<nav aria-label="Breadcrumb" className="flex">
			<ol role="list" className="mx-auto flex w-full max-w-screen-xl space-x-4 bg-[#2e026d] px-4 pt-2 sm:px-6 lg:px-8">
				<li className="flex">
					<div className="flex items-center">
						<Link href="/" className="text-gray-400 hover:text-gray-200">
							<HomeIcon aria-hidden="true" className="h-5 w-5 flex-shrink-0" />
							<span className="sr-only">Home</span>
						</Link>
					</div>
				</li>
				<li key="team" className="flex">
					{pieces.map((piece, index) => (
						<div className="flex items-center" key={piece.name}>
							<svg
								fill="currentColor"
								viewBox="0 0 24 44"
								preserveAspectRatio="none"
								aria-hidden="true"
								className="h-full w-6 flex-shrink-0 text-gray-300 hover:text-gray-100">
								<path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
							</svg>
							<Link
								href={piece.url}
								aria-current="page"
								className="ml-4 text-sm font-medium text-gray-300 hover:text-gray-100">
								{piece.name}
							</Link>
						</div>
					))}
				</li>
			</ol>
		</nav>
	);
}
