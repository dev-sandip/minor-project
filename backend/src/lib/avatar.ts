export function generateAvatar(name: string): string {
  const uniqueId: string = name.trim().toLowerCase();

  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(uniqueId)}`;
}