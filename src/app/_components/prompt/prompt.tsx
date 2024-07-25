"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import UpdatePrompt from "./updatePrompt";
import Link from "next/link";
import Loading from "../loading";

export function Prompt({ teamId, projectId, promptId }: { teamId: string; projectId: string; promptId: string }) {
	const [prompt] = api.prompt.get.useSuspenseQuery({ promptId });
	const [openUpdate, setOpenUpdate] = useState(false);
	const [text, setText] = useState(prompt.text);
	const utils = api.useUtils();

	const updatePrompt = api.prompt.update.useMutation({
		onSuccess: async () => {
			await utils.prompt.invalidate();
		},
	});

	return (
		<div className="w-full max-w-lg text-center">
			<h1 className="mb-4 text-5xl font-extrabold tracking-tight">Prompt: {prompt?.name}</h1>
			<p className="text-lg">Your permission level: {prompt?.permission}</p>
			<p className="text-lg">
				<span>Prompt Text</span>
				<br />
				<textarea
					value={text}
					onChange={(e) => {
						setText(e.target.value);
					}}
					className="rounded-md bg-gray-800 p-2"></textarea>
			</p>

			{["ADMIN", "MANAGER", "WRITER"].includes(prompt.permission) && (
				<div>
					<button
						onClick={() => {
							updatePrompt.mutate({
								projectId,
								promptId,
								name: prompt.name,
								text,
							});
						}}
						className="mt-4 rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
						disabled={updatePrompt.isPending || text === prompt.text}>
						{updatePrompt.isPending ? <Loading /> : "Save"}
					</button>
					<button
						onClick={() => {
							setOpenUpdate(true);
						}}
						className="ml-4 mt-4 rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">
						Edit Prompt
					</button>
				</div>
			)}

			<UpdatePrompt open={openUpdate} setOpen={setOpenUpdate} prompt={prompt} teamId={teamId} projectId={projectId} />
		</div>
	);
}
