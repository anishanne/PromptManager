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

      if (!team) throw new TRPCError({ code: "NOT_FOUND" });
      if (
        !team.users.some(
          (user) =>
            user.userId === ctx.session.user.id &&
            [Role.MANAGER, Role.ADMIN].includes(user.role),
        )
      )
        return new TRPCError({ code: "FORBIDDEN" });

      return ctx.db.project.create({
        data: input,
      });
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.id },
        include: { prompts: true, team: { include: { users: true } } },
      });

      if (!project) throw new TRPCError({ code: "NOT_FOUND" });
      if (
        !project.team.users.some((user) => user.userId === ctx.session.user.id)
      )
        return new TRPCError({ code: "FORBIDDEN" });

      return project;
    }),

  update: protectedProcedure
    .input(z.object({ name: z.string().min(1), projectId: z.string().min(1) }))
    .mutation(async ({ ctx, input: { name, projectId } }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: projectId },
        include: { prompts: true, team: { include: { users: true } } },
      });

      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      if (
        !project.team.users.some(
          (user) =>
            user.userId === ctx.session.user.id && user.role === Role.ADMIN,
        )
      )
        return new TRPCError({ code: "FORBIDDEN" });

      return ctx.db.project.update({
        where: { id: projectId },
        data: { name },
      });
    }),
});
