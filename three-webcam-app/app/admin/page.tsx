import ChannelWrapper from "../components/client/ChannelWrapper";
import PlayerList from "../components/client/PlayerList";

export default function AdminPage() {
  return (
    <main className="flex h-[100vh] flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div>Waiting room - React Three Fiber - Demo</div>
      <ChannelWrapper>
        <PlayerList />
      </ChannelWrapper>
    </main>
  );
}
