import { postRouter } from "@/server/api/routers/post";
import { teamRouter } from "@/server/api/routers/team";
import { projectRouter } from "@/server/api/routers/project";
import { promptRouter } from "@/server/api/routers/prompt";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	post: postRouter,
	team: teamRouter,
	project: projectRouter,
	prompt: promptRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
