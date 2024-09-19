"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Webcam from "./Webcam";
import useUserStore from "@/app/store/userStore";
import colors from "nice-color-palettes";

const niceColors = [...colors[3], ...colors[2], ...colors[6]];
// [
//   "#99b898",
//   "#fecea8",
//   "#ff847c",
//   "#e84a5f",
//   "#2a363b",
//   "#fe4365",
//   "#fc9d9a",
//   "#f9cdad",
//   "#c8c8a9",
//   "#83af9b",
// ];

export default function SplashScreen({ onNext }: { onNext: () => void }) {
  const [username, setUsername] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const [showCamera, setShowCamera] = useState(false);
  const userStore = useUserStore();
  const { user, setUser } = userStore;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && selectedColor) {
      setUser({ color: selectedColor, username });
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          required
        />
      </div>
      <div>
        <Label>Choose your color</Label>
        <RadioGroup
          value={selectedColor}
          onValueChange={setSelectedColor}
          className="grid grid-cols-5 gap-2 mt-2"
        >
          {niceColors.map((color) => (
            <div key={color} className="flex items-center space-x-2">
              <RadioGroupItem value={color} id={color} className="sr-only" />
              <Label
                htmlFor={color}
                className="w-8 h-8 rounded-full cursor-pointer flex items-center justify-center"
                style={{ backgroundColor: color }}
              >
                {selectedColor === color && (
                  <div className="w-4 h-4 bg-white rounded-full" />
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!username || !selectedColor}
      >
        Next
      </Button>
    </form>
  );
}
