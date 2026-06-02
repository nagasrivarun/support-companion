import { Check } from "lucide-react";
import { getColorHex, isLightColor } from "@/lib/colors";
import { formatINR } from "@/lib/pricing";

interface VariantSelectorProps {
  colors?: string[];
  selectedColor?: string | null;
  onColorChange?: (color: string) => void;
  /**
   * When false the product has no real per-color images (all colors share the
   * base image). Swatches stay selectable for reference but we surface a hint
   * that the preview image won't change — no CSS tinting is ever applied.
   */
  colorImagesAvailable?: boolean;

  sizes?: string[];
  selectedSize?: string | null;
  onSizeChange?: (size: string) => void;

  storageOptions?: string[];
  selectedStorage?: string | null;
  onStorageChange?: (storage: string) => void;
  storagePriceDelta?: (storage: string) => number;
  basePrice?: number;
}

export function VariantSelector({
  colors,
  selectedColor,
  onColorChange,
  colorImagesAvailable = false,
  sizes,
  selectedSize,
  onSizeChange,
  storageOptions,
  selectedStorage,
  onStorageChange,
  storagePriceDelta,
  basePrice = 0,
}: VariantSelectorProps) {
  return (
    <div className="space-y-5">
      {storageOptions && storageOptions.length > 0 && (
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Storage: <span className="text-primary">{selectedStorage}</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {storageOptions.map((s) => {
              const delta = storagePriceDelta?.(s) ?? 0;
              const active = selectedStorage === s;
              return (
                <button
                  key={s}
                  onClick={() => onStorageChange?.(s)}
                  className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${
                    active
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="font-semibold text-foreground">{s}</div>
                  <div className="text-xs text-muted-foreground">
                    {delta > 0 ? `+${formatINR(delta)}` : formatINR(basePrice + delta)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {colors && colors.length > 0 && (
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Color: <span className="text-primary">{selectedColor}</span>
            {!colorImagesAvailable && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                (Color reference only)
              </span>
            )}
          </label>
          <div className="flex flex-wrap gap-3">
            {colors.map((c) => {
              const bg = getColorHex(c);
              const light = isLightColor(c);
              const active = selectedColor === c;
              return (
                <button
                  key={c}
                  onClick={() => onColorChange?.(c)}
                  aria-label={`Select color ${c}`}
                  title={c}
                  className={`relative w-10 h-10 rounded-full transition-all duration-200 ${
                    active
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                      : "ring-1 ring-border hover:ring-primary/50"
                  }`}
                  style={{ backgroundColor: bg }}
                >
                  {active && (
                    <Check
                      className={`h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
                        light ? "text-foreground" : "text-white"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {sizes && sizes.length > 0 && (
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Size: <span className="text-primary">{selectedSize}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => onSizeChange?.(s)}
                className={`min-w-[3rem] px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  selectedSize === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
