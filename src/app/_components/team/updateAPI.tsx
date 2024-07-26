"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { api } from "@/trpc/react";
import Loading from "../loading";
import { type Team, type Project, type Permission, type User, Role } from "@prisma/client";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/20/solid";
import Error from "../error";

export default function UpdateAPI({
	open,
	setOpen,
	team,
	user,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	team: Team & { projects: Project[] };
	user: { id: string };
}) {
	const utils = api.useUtils();

	const [userEmail, setUserEmail] = useState("");
	const [role, setRow] = useState(Role.VIEWER);

	const regenKey = api.team.api.useMutation({
		onSuccess: async () => {
			await utils.team.invalidate();
		},
	});

	return (
		<Dialog open={open} onClose={setOpen} className="relative z-10">
			<DialogBackdrop
				transition
				className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
			/>

			<div className="fixed inset-0 z-10 w-screen overflow-y-auto">
				<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
					<DialogPanel
						transition
						className="relative transform rounded-lg bg-gray-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95">
						<div>
							<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
								<UserGroupIcon aria-hidden="true" className="h-6 w-6 text-indigo-600" />
							</div>
							<div className="mt-3 text-center sm:mt-5">
								<DialogTitle as="h3" className="text-base font-semibold leading-6 text-gray-100">
									Update Permissions
								</DialogTitle>
								<div className="mt-2">
									<p className="text-sm text-gray-400">
										<div>
											API Key: {team.apiKey}
											<button
												onClick={() => regenKey.mutate({teamId: team.id})}
												className="ml-2 inline-flex items-center px-2 py-1.5 border border-gray-700 rounded-md text-sm font-semibold text-gray-200 bg-gray-800 hover:bg-gray-700">
												<CheckIcon className="h-4 w-4" />
												<span className="ml-1">Regenerate</span>
										</div>
									</p>
								</div>
							</div>
						</div>
						<Error message={regenKey?.error?.message} />
						<div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:gap-3">
							<button
								type="button"
								data-autofocus
								onClick={() => setOpen(false)}
								className="mt-3 inline-flex w-full justify-center rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-100 shadow-sm ring-1 ring-inset ring-gray-600 hover:bg-gray-700 sm:col-start-1 sm:mt-0">
								{regenKey.isPending ? (
									<Loading />
								) : (
									"Close"
								)}
							</button>
						</div>
					</DialogPanel>
				</div>
			</div>
		</Dialog>
	);
}
