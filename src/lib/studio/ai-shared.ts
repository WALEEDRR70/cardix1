// Pure helpers used to normalise the AI card analysis (kept out of the server-fn module).
import type { AiBlockRole } from "./ai.functions";

export const ROLES: AiBlockRole[] = [
  "logo", "photo", "name", "title", "company", "tagline",
  "phone", "email", "website", "address", "qr", "cta", "custom",
];

export function clamp(n: unknown, min = 0, max = 100): number {
  const v = typeof n === "number" && Number.isFinite(n) ? n : min;
  return Math.min(max, Math.max(min, v));
}
