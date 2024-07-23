import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const projectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), teamId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.create({
        data: input,
      });
    }),

  list: protectedProcedure
    .input(z.object({ teamId: z.string().min(1) }))
    .query(async ({ ctx, input: { teamId } }) => {
      const teamWithProjects = await ctx.db.team.findFirst({
        where: {
          users: { some: { userId: ctx.session.user.id } },
          id: teamId,
        },
        include: {
          projects: true,
        },
      });
      if (!teamWithProjects) throw new TRPCError({ code: "NOT_FOUND" });

      return teamWithProjects.projects ?? [];
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const team = await ctx.db.team.findFirst({
        where: {
          users: { some: { userId: ctx.session.user.id } },
          id: input.id,
        },
      });

      return team ?? null;
    }),
});
