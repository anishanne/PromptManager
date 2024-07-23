import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { Role } from "@prisma/client";

export const teamRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
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

  get: protectedProcedure
    .input(z.object({ teamId: z.string().min(1) }))
    .query(async ({ ctx, input: { teamId } }) => {
      const team = await ctx.db.team.findFirst({
        where: {
          users: { some: { userId: ctx.session.user.id } },
          id: teamId,
        },
        include: { projects: true },
      });

      return team ?? null;
    }),

  update: protectedProcedure
    .input(z.object({ teamId: z.string().min(1), name: z.string().min(1) }))
    .mutation(async ({ ctx, input: { teamId, name } }) => {
      return await ctx.db.team.update({
        where: { id: teamId },
        data: { name },
      });
      //   const team = await ctx.db.team.findFirst({
      //     where: {
      //       users: { some: { userId: ctx.session.user.id } },
      //       id: teamId,
      //     },
      //     include: { projects: true },
      //   });
    }),
});
