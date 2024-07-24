import { Projects } from "@/app/_components/team/projects";
import { getServerAuthSession } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";

export default async function Home({ params }: { params: { tid: string } }) {
  const session = await getServerAuthSession();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          {session?.user && <Projects teamId={params.tid} />}
        </div>
      </main>
    </HydrateClient>
  );
}
