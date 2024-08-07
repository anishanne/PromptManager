"use client";

import { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { api } from "@/trpc/react";
import Loading from "../loading";
import Error from "../error";

export default function CreateTeam({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
	const [name, setName] = useState("");
	const utils = api.useUtils();

	const createTeam = api.team.create.useMutation({
		onSuccess: async () => {
			await utils.team.invalidate();
			setName("");
			setOpen(false);
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
						className="relative transform overflow-hidden rounded-lg bg-gray-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95">
						<div>
							<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
								<UserGroupIcon aria-hidden="true" className="h-6 w-6 text-indigo-600" />
							</div>
							<div className="mt-3 text-center sm:mt-5">
								<DialogTitle as="h3" className="text-base font-semibold leading-6 text-gray-100">
									Create Team
								</DialogTitle>
								<div className="mt-2">
									<p className="text-sm text-gray-500">
										<div>
											<label htmlFor="email" className="block text-left text-sm font-medium leading-6 text-gray-200">
												Team Name
											</label>
											<div className="mt-2">
												<input
													type="text"
													name="name"
													id="name"
													className="block w-full rounded-md border-0 bg-gray-800 py-1.5 pl-2 text-gray-200 shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
													placeholder="English 101"
													onChange={(e) => setName(e.target.value)}
												/>
											</div>
										</div>
									</p>
								</div>
							</div>
						</div>
						<Error message={createTeam?.error?.message} />
						<div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
							<button
								type="button"
								onClick={() => createTeam.mutate({ name })}
								className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-75 disabled:hover:bg-indigo-600 sm:col-start-2"
								disabled={createTeam.isPending || !name}>
								{createTeam.isPending ? <Loading /> : "Create"}
							</button>
							<button
								type="button"
								data-autofocus
								onClick={() => setOpen(false)}
								className="mt-3 inline-flex w-full justify-center rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-100 shadow-sm ring-1 ring-inset ring-gray-600 hover:bg-gray-700 sm:col-start-1 sm:mt-0">
								Cancel
							</button>
						</div>
					</DialogPanel>
				</div>
			</div>
		</Dialog>
	);
}
