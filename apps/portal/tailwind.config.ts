import type { Config } from "tailwindcss";
import sharedPreset from "../../packages/shared/tailwind/preset";

export default {
  ...sharedPreset,
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/shared/ui/**/*.{ts,tsx}",
    "../../packages/shared/hooks/**/*.{ts,tsx}",
  ],
} satisfies Config;
