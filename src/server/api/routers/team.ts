import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { Role } from "@prisma/client";

export const teamRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const permission = await ctx.db.permission.create({
        data: {
          userId: ctx.session.user.id,
          role: Role.ADMIN,
        },
      });

      return ctx.db.team.create({
        data: {
          id: permission.teamId,
          name: input.name,
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
