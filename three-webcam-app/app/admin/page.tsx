import { getAllPlayersInDb } from "@/prisma/databaseActions";
import Image from "next/image";
import PlayerList from "../components/client/PlayerList";
import ShowTime from "../components/client/ShowTime";

const activeLinkClass = "bg-muted text-primary";

export default async function AdminPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <main className="flex h-[100vh] flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div>Admin panel</div>
      <PlayerList />
    </main>
  );
}
