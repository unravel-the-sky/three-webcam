import { Button } from "@/components/ui/button";
import ShowTime from "../components/client/ShowTime";
import DisplayShow from "../components/client/DisplayShow";

export default function DisplayPage() {
  return (
    <div className="fixed w-full left-0 top-0 h-full bg-gray-600 p-4">
      <DisplayShow />
    </div>
  );
}
