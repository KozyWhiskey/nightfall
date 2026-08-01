import { useEffect, useState, type ReactNode } from "react";
import type { SilhouetteVariant } from "./artMap.js";

/**
 * Presentation-only image with graceful fallback when the asset 404s or fails to decode.
 * Gameplay text/labels remain the source of truth — never encode rules in the image alone.
 */
export function ArtImage({
  src,
  alt = "",
  className,
  fallback
}: {
  src: string | undefined;
  alt?: string;
  className?: string;
  fallback: ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (src === undefined || failed) return <>{fallback}</>;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}

export function Silhouette({ variant, className }: { variant: SilhouetteVariant; className?: string }) {
  return (
    <div className={["silhouette", `silhouette-${variant}`, className].filter(Boolean).join(" ")} aria-hidden="true">
      <span />
    </div>
  );
}

/** Combat portrait: tries id-keyed art, falls back to CSS silhouette. */
export function CombatPortrait({
  src,
  variant,
  className,
  facing = "right"
}: {
  src: string;
  variant: SilhouetteVariant;
  className?: string;
  facing?: "left" | "right";
}) {
  const facingClass = facing === "left" ? "is-facing-left" : "is-facing-right";
  return (
    <ArtImage
      src={src}
      className={["art-portrait", facingClass, className].filter(Boolean).join(" ")}
      fallback={<Silhouette variant={variant} className={facingClass} />}
    />
  );
}

/** Intent glyph art with text fallback character (color is never the only signal). */
export function IntentGlyph({
  src,
  textFallback,
  className
}: {
  src: string;
  textFallback: string;
  className?: string;
}) {
  return (
    <ArtImage
      src={src}
      className={["intent-glyph-art", className].filter(Boolean).join(" ")}
      fallback={<span aria-hidden="true">{textFallback}</span>}
    />
  );
}
