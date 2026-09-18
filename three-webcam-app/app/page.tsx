import { Button } from "@/components/ui/button";
import AppWrapper from "./components/client/AppWrapper";
import ChannelWrapper from "./components/client/ChannelWrapper";

export default function Home() {
  return (
    <div className="flex flex-col gap-4 justify-center items-center">
      <ChannelWrapper>
        {/* <Button variant={"ghost"}>offline :shrug:</Button> */}
        <AppWrapper />
      </ChannelWrapper>
    </div>
  );
}
