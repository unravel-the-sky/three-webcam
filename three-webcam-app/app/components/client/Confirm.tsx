import useUserStore from "@/app/store/userStore";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Confirm({ onConfirm }: { onConfirm: () => void }) {
  const userStore = useUserStore();
  const { user } = userStore;
  return (
    <div className="flex flex-col gap-4">
      <p>{user.color}</p>
      {user.image && (
        <Image src={user.image} width={500} height={500} alt="image" />
      )}
      <Button variant={"blue"} onClick={onConfirm}>
        Upload
      </Button>
    </div>
  );
}
