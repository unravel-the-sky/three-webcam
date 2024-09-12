import AppWrapper from "./components/client/AppWrapper";
import SplashScreen from "./components/client/SplashScreen";
import Webcam from "./components/client/Webcam";

export default function Home() {
  return (
    <div className="flex flex-col gap-4 justify-center items-center">
      <AppWrapper />
    </div>
  );
}
