import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Status } from "@prisma/client";

export const promptRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				text: z.string().min(1),
				projectId: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const project = await ctx.db.project.findFirst({
				where: { id: input.projectId },
				include: { team: { include: { users: true } } },
			});
			if (!project) throw new TRPCError({ code: "NOT_FOUND" });
			if (!project.team.users.some((user) => user.userId === ctx.session.user.id))
				throw new TRPCError({ code: "UNAUTHORIZED" });

			return ctx.db.prompt.create({
				data: {
					...input,
					status: Status.DRAFT,
					createdById: ctx.session.user.id,
				},
			});
		}),

	update: protectedProcedure
		.input(
			z.object({
				promptId: z.string().min(1),
				name: z.string().min(1),
				text: z.string().min(1),
				projectId: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input: { promptId, name, text, projectId } }) => {
			const prompt = await ctx.db.prompt.findFirst({
				where: { id: promptId },
				include: {
					project: {
						include: {
							team: {
								include: {
									users: true,
								},
							},
						},
					},
				},
			});
			if (!prompt) throw new TRPCError({ code: "NOT_FOUND" });
			if (
				!prompt.project.team.users.some(
					(user) => user.userId === ctx.session.user.id && ["ADMIN", "MANAGER", "WRITER"].includes(user.role),
				)
			)
				throw new TRPCError({ code: "UNAUTHORIZED" });

			return ctx.db.prompt.update({
				where: { id: promptId },
				data: {
					name,
					text,
					projectId,
				},
			});
		}),

	get: protectedProcedure
		.input(z.object({ promptId: z.string().min(1) }))
		.query(async ({ ctx, input: { promptId } }) => {
			const prompt = await ctx.db.prompt.findFirst({
				where: { id: promptId },
				include: {
					project: {
						include: {
							team: {
								include: {
									users: true,
								},
							},
						},
					},
				},
			});
			if (!prompt) throw new TRPCError({ code: "NOT_FOUND" });

			const permission = prompt.project.team.users.find((user) => user.userId === ctx.session.user.id);
			if (!permission) throw new TRPCError({ code: "FORBIDDEN" });

			return { ...prompt, permission: permission.role };
		}),

	delete: protectedProcedure
		.input(z.object({ promptId: z.string().min(1) }))
		.mutation(async ({ ctx, input: { promptId } }) => {
			const prompt = await ctx.db.prompt.findFirst({
				where: { id: promptId },
				include: {
					project: {
						include: {
							team: {
								include: {
									users: true,
								},
							},
						},
					},
				},
			});
			if (!prompt) throw new TRPCError({ code: "NOT_FOUND" });
			if (
				!prompt.project.team.users.some(
					(user) => user.userId === ctx.session.user.id && ["ADMIN", "MANAGER"].includes(user.role),
				)
			)
				throw new TRPCError({ code: "UNAUTHORIZED" });

			return ctx.db.prompt.delete({
				where: { id: promptId },
			});
		}),

	list: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.prompt.findMany({
			include: {
				project: {
					include: {
						team: {
							include: {
								users: true,
							},
						},
					},
				},
			},
			where: {
				project: {
					team: {
						users: {
							some: {
								userId: ctx.session.user.id,
							},
						},
					},
				},
			},
		});
	}),
});
