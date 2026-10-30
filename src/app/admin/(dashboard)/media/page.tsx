import { libraryOptions } from "@/lib/media-library";
import { requireAdmin } from "@/lib/server/admin-auth";
import { listMedia } from "@/lib/server/admin-store";
import { MediaManager } from "@/components/admin/MediaManager";

// Admin pages read the session on every request and redirect when signed out.
export const instant = false;

export default async function MediaPage() {
  await requireAdmin();
  const uploads = await listMedia();
  return (
    <div className="max-w-6xl">
      <p className="kicker text-burgundy">Media</p>
      <h1 className="headline mt-2 text-5xl">Image library</h1>
      <p className="mt-2 max-w-3xl text-charcoal">
        Upload JPEG, PNG, WebP, GIF or AVIF images up to 5 MB. Use them anywhere an image can be chosen in the editor —
        hero collage layers live under <strong>Layout images</strong>, photos under each story. Only upload images you
        have the right to publish.
      </p>
      <MediaManager uploads={uploads} library={libraryOptions()} />
    </div>
  );
}
