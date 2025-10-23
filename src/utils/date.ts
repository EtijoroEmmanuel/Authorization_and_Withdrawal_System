export const formatDate = (date: Date | string | null): string | null => {
  if (!date) return null;

  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString("en-NG", { timeZone: "Africa/Lagos" });
  } catch {
    return null;
  }
};
