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
});
