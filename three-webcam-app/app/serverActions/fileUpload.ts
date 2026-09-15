"use server";

import { uploadImage } from "@/lib/s3";
import { createPlayerInDb } from "@/prisma/databaseActions";

/** Creates a player from the sign-up form: uploads the selfie to S3, then stores the player row. */
export const submitForm = async (formData: FormData) => {
  const username = String(formData.get("username") ?? "").trim();
  const color = String(formData.get("color") ?? "");
  const image = formData.get("image");

  if (!username) throw new Error("username is required");

  let avatar = "";
  if (image instanceof File && image.size > 0) {
    try {
      avatar = await uploadImage(image, username);
    } catch (err) {
      // A missing photo is not fatal - the ball falls back to a placeholder texture.
      console.error("[submitForm] image upload failed:", err);
    }
  }

  return createPlayerInDb({ username, color, image: avatar });
};
