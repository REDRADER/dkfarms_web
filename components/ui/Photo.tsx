import Image, { type ImageProps } from "next/image";
import { images } from "@/content/images.generated";

type PhotoProps = Omit<ImageProps, "src" | "alt" | "placeholder"> & {
  /** Image key from content files, e.g. "pool-villa" for assets/photos/pool-villa.jpg */
  image: string;
  alt: string;
};

/**
 * Every photo on the site goes through here: next/image serves AVIF/WebP at the
 * size each screen needs, lazy-loads below the fold and shows a blurred preview
 * while loading. Pass `sizes` whenever the photo isn't full-width.
 */
export function Photo({ image, alt, sizes = "100vw", ...rest }: PhotoProps) {
  const src = images[image];
  if (!src) throw new Error(`Unknown photo "${image}"`);
  return <Image src={src} alt={alt} sizes={sizes} placeholder="blur" {...rest} />;
}
