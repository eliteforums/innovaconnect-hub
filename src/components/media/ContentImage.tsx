import Image from "next/image";
import { resolveImage } from "@/lib/media-library";

type Props = {
  /** Media-library key or uploaded-image URL. */
  src: string | null | undefined;
  alt: string;
  sizes?: string;
  className?: string;
  style?: React.CSSProperties;
  preload?: boolean;
  fill?: boolean;
  placeholder?: "blur" | "empty";
};

/**
 * Renders an image chosen in content. Built-in images are optimised by
 * next/image; uploaded images are served as-is (they are already sized by
 * the upload limit and may live on another host).
 */
export function ContentImage({ src, alt, sizes, className, style, preload, fill, placeholder = "empty" }: Props) {
  const resolved = resolveImage(src);
  if (!resolved) return null;
  if (typeof resolved === "string") {
    return fill ? (
      <Image
        src={resolved}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        style={style}
        preload={preload}
        unoptimized
      />
    ) : (
      // Uploaded images have unknown dimensions; size them with CSS.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolved}
        alt={alt}
        className={className}
        style={style}
        loading={preload ? "eager" : "lazy"}
        fetchPriority={preload ? "high" : "auto"}
      />
    );
  }
  return (
    <Image
      src={resolved}
      alt={alt}
      sizes={sizes}
      className={className}
      style={style}
      preload={preload}
      fill={fill}
      placeholder={placeholder}
    />
  );
}
