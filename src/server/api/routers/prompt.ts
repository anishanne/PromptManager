import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const promptRouter = createTRPCRouter({
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
      const team = await ctx.db.team.findFirst({
        where: {
          users: {
            some: {
              userId: ctx.session.user.id,
            },
          },
          id: teamId,
        },
      });
      if (!team) throw new TRPCError({ code: "NOT_FOUND" });

      const projects = await ctx.db.project.findMany({
        where: {
          teamId,
        },
      });

      return projects ?? [];
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const team = await ctx.db.team.findFirst({
        where: {
          users: {
            some: {
              userId: ctx.session.user.id,
            },
          },
          id: input.id,
        },
      });

      return team ?? null;
    }),
});
