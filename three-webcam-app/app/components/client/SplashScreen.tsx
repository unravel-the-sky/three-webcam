"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Webcam from "./Webcam";
import useUserStore from "@/app/store/userStore";

const colors = [
  { name: "Red", value: "#FF0000" },
  { name: "Blue", value: "#0000FF" },
  { name: "Green", value: "#00FF00" },
  { name: "Yellow", value: "#FFFF00" },
  { name: "Purple", value: "#800080" },
  { name: "Orange", value: "#FFA500" },
  { name: "Pink", value: "#FFC0CB" },
  { name: "Teal", value: "#008080" },
  { name: "Lime", value: "#738a73" },
  { name: "Brown", value: "#A52A2A" },
];

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
          {colors.map((color) => (
            <div key={color.value} className="flex items-center space-x-2">
              <RadioGroupItem
                value={color.value}
                id={color.value}
                className="sr-only"
              />
              <Label
                htmlFor={color.value}
                className="w-8 h-8 rounded-full cursor-pointer flex items-center justify-center"
                style={{ backgroundColor: color.value }}
              >
                {selectedColor === color.value && (
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
