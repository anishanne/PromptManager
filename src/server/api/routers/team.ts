import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Role } from "@prisma/client";
import { permission } from "process";

export const teamRouter = createTRPCRouter({
	create: protectedProcedure.input(z.object({ name: z.string().min(1) })).mutation(async ({ ctx, input }) => {
		const team = await ctx.db.team.create({
			data: { name: input.name },
		});
		return ctx.db.permission.create({
			data: {
				userId: ctx.session.user.id,
				teamId: team.id,
				role: Role.ADMIN,
			},
		});
	}),

	list: protectedProcedure.query(async ({ ctx }) => {
		const teams = await ctx.db.team.findMany({
			where: { users: { some: { userId: ctx.session.user.id } } },
			include: { projects: { select: { id: true } } },
		});

		return teams ?? [];
	}),

	get: protectedProcedure.input(z.object({ teamId: z.string().min(1) })).query(async ({ ctx, input: { teamId } }) => {
		const team = await ctx.db.team.findFirst({
			where: {
				users: { some: { userId: ctx.session.user.id } },
				id: teamId,
			},
			include: { projects: { include: { prompts: true } }, users: true },
		});
		if (!team) throw new TRPCError({ code: "NOT_FOUND" });

		const user = team.users.find((user) => user.userId === ctx.session.user.id);
		if (!user) throw new TRPCError({ code: "NOT_FOUND" });

		return { ...team, permission: user.role };
	}),

	update: protectedProcedure
		.input(z.object({ teamId: z.string().min(1), name: z.string().min(1) }))
		.mutation(async ({ ctx, input: { teamId, name } }) => {
			return await ctx.db.team.update({
				where: { id: teamId },
				data: { name },
			});
		}),

	delete: protectedProcedure
		.input(z.object({ teamId: z.string().min(1) }))
		.mutation(async ({ ctx, input: { teamId } }) => {
			const team = await ctx.db.team.findFirst({
				where: {
					users: { some: { userId: ctx.session.user.id } },
					id: teamId,
				},
				include: { projects: true, users: true },
			});

			if (!team) throw new TRPCError({ code: "NOT_FOUND" });
			if (!team.users.some((user) => user.userId === ctx.session.user.id && Role.ADMIN == user.role))
				return new TRPCError({ code: "FORBIDDEN" });

			if (team.projects.length > 0) throw new TRPCError({ code: "BAD_REQUEST" });

			return ctx.db.$transaction([
				ctx.db.permission.deleteMany({ where: { teamId } }),
				ctx.db.team.delete({ where: { id: teamId } }),
			]);
		}),

	permissions: protectedProcedure
		.input(z.object({ teamId: z.string().min(1) }))
		.query(async ({ ctx, input: { teamId } }) => {
			const team = await ctx.db.team.findFirst({
				where: {
					users: { some: { userId: ctx.session.user.id } },
					id: teamId,
				},
				include: { users: true },
			});

			if (!team) throw new TRPCError({ code: "NOT_FOUND" });
			if (!team.users.some((user) => user.userId === ctx.session.user.id && Role.ADMIN == user.role))
				return new TRPCError({ code: "FORBIDDEN" });

			return await ctx.db.permission.findMany({
				where: { teamId },
				include: { user: true },
			});
		}),

	permissionsUpdate: protectedProcedure
		.input(z.object({ teamId: z.string().min(1), userId: z.string().min(1), role: z.nativeEnum(Role) }))
		.mutation(async ({ ctx, input: { teamId, userId, role } }) => {
			const team = await ctx.db.team.findFirst({
				where: {
					users: { some: { userId: ctx.session.user.id } },
					id: teamId,
				},
				include: { users: true },
			});

			if (!team) throw new TRPCError({ code: "NOT_FOUND" });
			if (!team.users.some((user) => user.userId === ctx.session.user.id && Role.ADMIN == user.role))
				return new TRPCError({ code: "FORBIDDEN" });

			return ctx.db.permission.upsert({
				where: { permissionId: { teamId, userId } },
				update: { role },
				create: { userId, teamId, role },
			});
		}),

	permissionsRemove: protectedProcedure
		.input(z.object({ teamId: z.string().min(1), userId: z.string().min(1) }))
		.mutation(async ({ ctx, input: { teamId, userId } }) => {
			const team = await ctx.db.team.findFirst({
				where: {
					users: { some: { userId: ctx.session.user.id } },
					id: teamId,
				},
				include: { users: true },
			});

			if (!team) throw new TRPCError({ code: "NOT_FOUND" });
			if (!team.users.some((user) => user.userId === ctx.session.user.id && Role.ADMIN == user.role))
				return new TRPCError({ code: "FORBIDDEN" });

			return ctx.db.permission.delete({
				where: { permissionId: { teamId, userId } },
			});
		}),

	permissionsAdd: protectedProcedure
		.input(z.object({ teamId: z.string().min(1), userEmail: z.string().min(1), role: z.nativeEnum(Role) }))
		.mutation(async ({ ctx, input: { teamId, userEmail, role } }) => {
			const team = await ctx.db.team.findFirst({
				where: {
					users: { some: { userId: ctx.session.user.id } },
					id: teamId,
				},
				include: { users: true },
			});

			if (!team) throw new TRPCError({ code: "NOT_FOUND" });
			if (!team.users.some((user) => user.userId === ctx.session.user.id && Role.ADMIN == user.role))
				return new TRPCError({ code: "FORBIDDEN" });

			const user = await ctx.db.user.findFirst({ where: { email: userEmail } });
			if (!user) throw new TRPCError({ code: "NOT_FOUND" });

			return ctx.db.permission.create({
				data: { userId: user.id, teamId, role },
			});
		}),
});
