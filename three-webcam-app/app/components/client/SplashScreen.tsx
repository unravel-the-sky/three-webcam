"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useUserStore from "@/app/store/userStore";
import palettes from "nice-color-palettes";

const niceColors = [...palettes[3], ...palettes[2], ...palettes[6]];

export default function SplashScreen({ onNext }: { onNext: () => void }) {
  const [username, setUsername] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const { setUser } = useUserStore();

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
          className="text-base"
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
          className="mt-2 grid grid-cols-5 gap-2"
        >
          {niceColors.map((color) => (
            <div key={color} className="flex items-center space-x-2">
              <RadioGroupItem value={color} id={color} className="sr-only" />
              <Label
                htmlFor={color}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full"
                style={{ backgroundColor: color }}
              >
                {selectedColor === color && <div className="h-4 w-4 rounded-full bg-white" />}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Button type="submit" className="w-full" disabled={!username || !selectedColor}>
        Next
      </Button>
    </form>
  );
}
