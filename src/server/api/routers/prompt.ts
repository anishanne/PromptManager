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
        data: { ...input, status: Status.DRAFT },
      });
    }),

  list: protectedProcedure
    .input(z.object({ projectId: z.string().min(1) }))
    .query(async ({ ctx, input: { projectId } }) => {
      const prompts = await ctx.db.prompt.findMany({
        where: {
          projectId,
        },
      });

      return prompts ?? [];
    }),

  get: protectedProcedure
    .input(z.object({ promptId: z.string().min(1) }))
    .query(async ({ ctx, input: { promptId } }) => {
      const prompt = await ctx.db.prompt.findFirst({
        where: { id: promptId },
      });

      if (!prompt)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Prompt not found",
        });

      return prompt ?? null;
    }),
});
