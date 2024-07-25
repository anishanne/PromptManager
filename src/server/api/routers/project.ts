import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Role } from "@prisma/client";

export const projectRouter = createTRPCRouter({
	create: protectedProcedure
		.input(z.object({ name: z.string().min(1), teamId: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			const team = await ctx.db.team.findFirst({
				where: {
					users: { some: { userId: ctx.session.user.id } },
					id: input.teamId,
				},
				include: { projects: true, users: true },
			});

			if (!team) throw new TRPCError({ code: "NOT_FOUND", message: "Team not found." });
			if (
				!team.users.some(
					(user) => user.userId === ctx.session.user.id && (user.role === "MANAGER" || user.role === "ADMIN"),
				)
			)
				return new TRPCError({ code: "FORBIDDEN", message: "Forbidden." });

			return ctx.db.project.create({
				data: input,
			});
		}),

	get: protectedProcedure.input(z.object({ id: z.string().min(1) })).query(async ({ ctx, input }) => {
		const project = await ctx.db.project.findFirst({
			where: { id: input.id },
			include: { prompts: true, team: { include: { users: true } } },
		});

		if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found." });

		const permission = project.team.users.find((user) => user.userId === ctx.session.user.id);
		if (!permission) throw new TRPCError({ code: "FORBIDDEN", message: "Forbidden." });

		return {
			...project,
			permission: permission.role,
		};
	}),

	delete: protectedProcedure.input(z.object({ id: z.string().min(1) })).mutation(async ({ ctx, input }) => {
		const project = await ctx.db.project.findFirst({
			where: { id: input.id },
			include: {
				prompts: true,
				team: {
					include: { users: true },
				},
			},
		});
		if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found." });
		if (
			!project.team.users.some(
				(user) => user.userId === ctx.session.user.id && (user.role === "ADMIN" || user.role === "MANAGER"),
			)
		)
			return new TRPCError({ code: "FORBIDDEN" });

		if (project.prompts.length > 0) return new TRPCError({ code: "BAD_REQUEST", message: "Project has prompts." });

		return ctx.db.project.delete({
			where: { id: input.id },
		});
	}),

	update: protectedProcedure
		.input(z.object({ name: z.string().min(1), projectId: z.string().min(1) }))
		.mutation(async ({ ctx, input: { name, projectId } }) => {
			const project = await ctx.db.project.findFirst({
				where: { id: projectId },
				include: { prompts: true, team: { include: { users: true } } },
			});

			if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found." });

			if (!project.team.users.some((user) => user.userId === ctx.session.user.id && user.role === Role.ADMIN))
				return new TRPCError({ code: "FORBIDDEN", message: "Forbidden." });

			return ctx.db.project.update({
				where: { id: projectId },
				data: { name },
			});
		}),

	list: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.project.findMany({
			where: { team: { users: { some: { userId: ctx.session.user.id } } } },
		});
	}),
});
