// Color name → hex map used for swatch UI ONLY.
// Never used to tint/recolor product images.
export const COLOR_HEX: Record<string, string> = {
  Black: "#1a1a1a", White: "#ffffff", Grey: "#9ca3af", Gray: "#9ca3af",
  Navy: "#1e3a5f", "Dark Blue": "#1e3a8a",
  Red: "#ef4444", Blue: "#3b82f6", Green: "#22c55e", Yellow: "#eab308",
  Pink: "#ec4899", Purple: "#a855f7", Orange: "#f97316", Brown: "#92400e",
  Beige: "#d4b896", Cream: "#fffdd0", "Sky Blue": "#87CEEB", "Sage Green": "#9DC183",
  "Dusty Pink": "#D4A5A5", Lavender: "#E6E6FA", Peach: "#FFDAB9", Maroon: "#800000",
  Teal: "#008080", Charcoal: "#36454F", Silver: "#C0C0C0", Gold: "#FFD700",
  "Rose Gold": "#b76e79", Titanium: "#878681", "Natural Titanium": "#9c8e7e",
  "Blue Titanium": "#4a5d7a", "White Titanium": "#e6e2d6", "Black Titanium": "#2b2b2b",
  "Space Grey": "#4b4b4b", "Space Black": "#2d2d2d", Midnight: "#1a1a2e",
  Starlight: "#f5ecd9",
  "White Floral": "#fff5f5", "Blue Floral": "#dbeafe", "Pink Floral": "#fce7f3",
  "Black/White": "#1a1a1a", "Red/White": "#ef4444", "Blue/Yellow": "#3b82f6",
  "White/Black": "#ffffff", "Grey/Black": "#6b7280",
};

export const LIGHT_COLORS = new Set([
  "White", "Cream", "Beige", "Yellow", "White Floral", "Lavender", "Peach",
  "Pink Floral", "Starlight", "White Titanium",
]);

export function getColorHex(name: string): string {
  return COLOR_HEX[name] || "#9ca3af";
}

export function isLightColor(name: string): boolean {
  return LIGHT_COLORS.has(name);
}
