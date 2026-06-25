export function humanizeError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes("row-level security"))        return "You don't have permission to do that. Make sure you're signed in as a tutor.";
  if (msg.includes("duplicate key") || msg.includes("unique constraint")) return "This record already exists.";
  if (msg.includes("foreign key"))               return "Can't delete — other records are linked to this one.";
  if (msg.includes("JWT") || msg.includes("not authenticated")) return "Your session expired. Please sign in again.";
  if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) return "Connection error. Check your internet and try again.";
  if (msg.includes("violates not-null"))         return "A required field is missing.";
  return msg;
}
