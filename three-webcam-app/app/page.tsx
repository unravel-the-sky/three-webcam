import AppWrapper from "./components/client/AppWrapper";
import ChannelWrapper from "./components/client/ChanellWrapper";

export default function Home() {
  return (
    <div className="flex flex-col gap-4 justify-center items-center">
      <ChannelWrapper>
        <AppWrapper />
      </ChannelWrapper>
    </div>
  );
}
