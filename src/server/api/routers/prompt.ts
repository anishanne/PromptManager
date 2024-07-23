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
      return ctx.db.prompt.create({
        data: {
          ...input,
          status: Status.DRAFT,
          createdById: ctx.session.user.id,
        },
      });
    }),

  list: protectedProcedure
    .input(z.object({ projectId: z.string().min(1) }))
    .query(async ({ ctx, input: { projectId } }) => {
      //   const teamWithProjects = await ctx.db.team.findFirst({
      //     where: {
      //       users: { some: { userId: ctx.session.user.id } },
      //       id: teamId,
      //     },
      //     include: {
      //       projects: true,
      //     },
      //   });
      //   if (!teamWithProjects) throw new TRPCError({ code: "NOT_FOUND" });

      //   return teamWithProjects.projects ?? [];

      const prompts = await ctx.db.prompt.findMany({
        where: { projectId },
      });

      return prompts ?? [];
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
      if (
        !prompt.project.team.users.some(
          (user) => user.userId === ctx.session.user.id,
        )
      )
        throw new TRPCError({ code: "UNAUTHORIZED" });

      //   const team = await ctx.db.team.findFirst({
      //     where: {
      //       users: { some: { userId: ctx.session.user.id } },
      //       id: prompt?.project.teamId,
      //     },
      //   });
      //   if (!team) throw new TRPCError({ code: "UNAUTHORIZED" });

      return prompt ?? null;
    }),
});
