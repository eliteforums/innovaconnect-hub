import { resolveImage } from "@/lib/media-library";
import { ContentImage } from "./ContentImage";
import type { MediaSlot } from "@/content/types";
import { Illustration } from "@/components/illustrations";

/**
 * Editorial figure. Renders an approved, licensed photograph when one is
 * configured for the slot; otherwise the original illustration.
 */
export function Figure({
  media,
  aspect = "aspect-[4/3]",
  caption,
  showCredit = true,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  className = "",
  priority = false,
}: {
  media: MediaSlot;
  aspect?: string;
  caption?: string;
  showCredit?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  const photo = media.photo?.approved && resolveImage(media.photo.src) ? media.photo : null;
  return (
    <figure className={className}>
      <div className={`relative overflow-hidden border border-ink ${aspect}`}>
        {photo ? (
          <ContentImage
            src={photo.src}
            alt={photo.alt ?? media.alt}
            fill
            sizes={sizes}
            priority={priority}
            placeholder={photo.fit === "contain" ? "empty" : "blur"}
            className={photo.fit === "contain" ? "bg-paper-deep object-contain p-[6%]" : "object-cover"}
            style={photo.position ? { objectPosition: photo.position } : undefined}
          />
        ) : (
          <div className="absolute inset-0">
            <Illustration kind={media.illustration} title={media.alt} />
          </div>
        )}
      </div>
      {(caption || showCredit) && (
        <figcaption className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          {caption && <span className="text-sm text-charcoal italic">{caption}</span>}
          {showCredit && (
            <span className="kicker text-[0.625rem] text-muted">
              {photo ? photo.credit : media.credit}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
