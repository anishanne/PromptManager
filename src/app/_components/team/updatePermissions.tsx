"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { api } from "@/trpc/react";
import Loading from "../loading";
import { Team, type Project, type Permission, type User, Role } from "@prisma/client";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/20/solid";

const roles = [Role.ADMIN, Role.MANAGER, Role.WRITER, Role.VIEWER];

function PermissionRow({
	permission,
	updatePermissions,
	removePermissions,
	user,
}: {
	permission: Permission & { user: User };
	updatePermissions: ReturnType<typeof api.team.permissionsUpdate.useMutation>;
	removePermissions: ReturnType<typeof api.team.permissionsRemove.useMutation>;
	user: { id: string };
}) {
	const [role, setRow] = useState(permission.role);

	useEffect(() => {
		if (role != permission.role)
			updatePermissions.mutate({ teamId: permission.teamId, userId: permission.userId, role });
	}, [role]);

	return (
		<tr key={permission.userId}>
			<td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-100 sm:pl-0">
				{permission.user.email}
			</td>
			<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">
				<Listbox value={role} onChange={setRow}>
					<div className="relative z-50">
						<ListboxButton
							className="relative w-full cursor-default rounded-md bg-gray-800 py-1.5 pl-3 pr-10 text-left text-gray-100 shadow-sm ring-1 ring-inset ring-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:opacity-75 sm:text-sm sm:leading-6"
							disabled={user.id === permission.userId}>
							<span className="block min-w-24 truncate">{role}</span>
							<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
								<ChevronUpDownIcon aria-hidden="true" className="h-5 w-5 text-gray-400" />
							</span>
						</ListboxButton>

						<ListboxOptions
							transition
							className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm">
							{roles.map((role) => (
								<ListboxOption
									key={role}
									value={role}
									className="group relative cursor-default select-none py-2 pl-8 pr-4 text-gray-100 data-[focus]:bg-indigo-600 data-[focus]:text-white">
									<span className="block truncate font-normal group-data-[selected]:font-semibold">{role}</span>

									<span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-indigo-600 group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
										<CheckIcon aria-hidden="true" className="h-5 w-5" />
									</span>
								</ListboxOption>
							))}
						</ListboxOptions>
					</div>
				</Listbox>
			</td>
			<td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-100 sm:pl-0">
				<button
					onClick={() => {
						removePermissions.mutate({ teamId: permission.teamId, userId: permission.userId });
					}}
					disabled={user.id === permission.userId}
					className="text-gray-400 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:text-gray-400">
					<XMarkIcon className="h-5 w-5" />
				</button>
			</td>
		</tr>
	);
}

export default function UpdatePermission({
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

	const [permissions] = api.team.permissions.useSuspenseQuery({ teamId: team.id });
	const [userEmail, setUserEmail] = useState("");
	const [role, setRow] = useState(Role.VIEWER);

	const updatePermissions = api.team.permissionsUpdate.useMutation({
		onSuccess: async () => {
			await utils.team.invalidate();
		},
	});

	const removePermissions = api.team.permissionsRemove.useMutation({
		onSuccess: async () => {
			await utils.team.invalidate();
		},
	});

	const addPermissions = api.team.permissionsAdd.useMutation({
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
											<table className="min-w-full divide-y divide-gray-600">
												<thead>
													<tr>
														<th
															scope="col"
															className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-100 sm:pl-0">
															Email
														</th>
														<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-100">
															Role
														</th>
														<th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
															<span className="sr-only">Edit</span>
														</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-gray-600">
													{permissions?.map((permission) => (
														<PermissionRow
															permission={permission}
															updatePermissions={updatePermissions}
															removePermissions={removePermissions}
															user={user}
														/>
													))}
													<tr>
														<td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-100 sm:pl-0">
															<input
																type="text"
																name="email"
																id="email"
																className="block w-full rounded-md border-0 bg-gray-800 py-1.5 pl-2 text-gray-200 shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
																placeholder="hello@example.com"
																onChange={(e) => setUserEmail(e.target.value)}
															/>
														</td>
														<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">
															<Listbox value={role} onChange={setRow}>
																<div className="relative">
																	<ListboxButton className="relative w-full cursor-default rounded-md bg-gray-800 py-1.5 pl-3 pr-10 text-left text-gray-100 shadow-sm ring-1 ring-inset ring-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
																		<span className="block min-w-24 truncate">{role}</span>
																		<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
																			<ChevronUpDownIcon aria-hidden="true" className="h-5 w-5 text-gray-400" />
																		</span>
																	</ListboxButton>

																	<ListboxOptions
																		transition
																		className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm">
																		{roles.map((role) => (
																			<ListboxOption
																				key={role}
																				value={role}
																				className="group relative cursor-default select-none py-2 pl-8 pr-4 text-gray-100 data-[focus]:bg-indigo-600 data-[focus]:text-white">
																				<span className="block truncate font-normal group-data-[selected]:font-semibold">
																					{role}
																				</span>

																				<span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-indigo-600 group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
																					<CheckIcon aria-hidden="true" className="h-5 w-5" />
																				</span>
																			</ListboxOption>
																		))}
																	</ListboxOptions>
																</div>
															</Listbox>
														</td>
														<td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-100 sm:pl-0">
															<button
																onClick={() => {
																	addPermissions.mutate({ teamId: team.id, userEmail, role });
																}}>
																<PlusIcon className="h-5 w-5 text-gray-400 hover:text-purple-500" />
															</button>
														</td>
													</tr>
													{addPermissions.isError && (
														<tr>
															<td colSpan={3} className="text-red-500">
																{addPermissions.error.message}
															</td>
														</tr>
													)}
													{updatePermissions.isError && (
														<tr>
															<td colSpan={3} className="text-red-500">
																{addPermissions.error.message}
															</td>
														</tr>
													)}
													{removePermissions.isError && (
														<tr>
															<td colSpan={3} className="text-red-500">
																{addPermissions.error.message}
															</td>
														</tr>
													)}
												</tbody>
											</table>
										</div>
									</p>
								</div>
							</div>
						</div>
						<div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:gap-3">
							<button
								type="button"
								data-autofocus
								onClick={() => setOpen(false)}
								className="mt-3 inline-flex w-full justify-center rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-100 shadow-sm ring-1 ring-inset ring-gray-600 hover:bg-gray-700 sm:col-start-1 sm:mt-0">
								{updatePermissions.isPending ? <Loading /> : "Close"}
							</button>
						</div>
					</DialogPanel>
				</div>
			</div>
		</Dialog>
	);
}
