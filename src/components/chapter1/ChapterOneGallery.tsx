import Image, { type StaticImageData } from "next/image";
import img3024 from "@/assets/IMG_3024.jpg";
import img3027 from "@/assets/IMG_3027.jpg";
import mdy3964 from "@/assets/MDY_3964.JPG";
import mdy4043 from "@/assets/MDY_4043.JPG";
import mdy4106 from "@/assets/MDY_4106.JPG";
import mdy4222 from "@/assets/MDY_4222.JPG";
import mdy4280 from "@/assets/MDY_4280.JPG";
import mdy4288 from "@/assets/MDY_4288.JPG";
import mdy4299 from "@/assets/MDY_4299.JPG";
import mdy4376 from "@/assets/MDY_4376.JPG";
import mdy4404 from "@/assets/MDY_4404.JPG";
import mdy4443 from "@/assets/MDY_4443.JPG";
import mdy4463 from "@/assets/MDY_4463.JPG";
import mdy4468 from "@/assets/MDY_4468.JPG";
import mdy4618 from "@/assets/MDY_4618.JPG";
import mdy4629 from "@/assets/MDY_4629.JPG";
import mdy4646 from "@/assets/MDY_4646.JPG";
import mdy4693 from "@/assets/MDY_4693.JPG";

const photos: { src: StaticImageData; alt: string }[] = [
  { src: img3024, alt: "Chapter 1 participants seated together during an event session." },
  { src: img3027, alt: "A group of participants posing in front of the InnovaHack Chapter 1 backdrop." },
  { src: mdy3964, alt: "A speaker addressing participants gathered for a session." },
  { src: mdy4043, alt: "Attendees discussing a laptop together at the event." },
  { src: mdy4106, alt: "Participants working at tables in a glass-walled room." },
  { src: mdy4222, alt: "A presenter showing work on a screen to seated participants." },
  { src: mdy4280, alt: "A small team collaborating around a table." },
  { src: mdy4288, alt: "Participants watching a presentation in a meeting room." },
  { src: mdy4299, alt: "A group gathered around a laptop during the hackathon." },
  { src: mdy4376, alt: "Team members talking around a table beside the venue windows." },
  { src: mdy4404, alt: "Chapter 1 trophies displayed together on a table." },
  { src: mdy4443, alt: "A participant writing on a sheet at the event." },
  { src: mdy4463, alt: "A presenter beside the Chapter 1 prize announcement screen." },
  { src: mdy4468, alt: "Participants gathered in the event venue beneath the Grow Together sign." },
  { src: mdy4618, alt: "A group standing in front of the InnovaHack Chapter 1 stage backdrop." },
  { src: mdy4629, alt: "Participants gathered for a group photo at the Chapter 1 event." },
  { src: mdy4646, alt: "A group posing in front of the Chapter 1 event screen." },
  { src: mdy4693, alt: "A team posing together in front of the InnovaHack Chapter 1 backdrop." },
];

function PhotoGroup({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div className="chapter-one-gallery-group">
      {photos.map((photo, index) => (
        <figure
          key={`${index}-${duplicate ? "duplicate" : "photo"}`}
          className="w-[82vw] max-w-[26rem] shrink-0"
        >
          <div className="relative aspect-[4/3] overflow-hidden border-2 border-ink bg-paper-deep">
            <Image
              src={photo.src}
              alt={duplicate ? "" : photo.alt}
              fill
              sizes="(min-width: 1024px) 416px, 82vw"
              className="object-cover"
            />
          </div>
        </figure>
      ))}
    </div>
  );
}

export function ChapterOneGallery() {
  return (
    <section aria-labelledby="chapter-one-gallery-title" className="mt-12">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker text-burgundy">Chapter 1 · 2026</p>
          <h3 id="chapter-one-gallery-title" className="headline mt-2 text-3xl uppercase sm:text-4xl">
            The first edition, in motion.
          </h3>
        </div>
        <p className="kicker text-muted">18 moments from the event</p>
      </div>

      <div
        className="chapter-one-gallery overflow-hidden"
        role="region"
        aria-label="Chapter 1 photo gallery. Photos move from right to left; focus or hover to pause."
        tabIndex={0}
      >
        <div className="chapter-one-gallery-track flex w-max">
          <PhotoGroup />
          <div aria-hidden="true">
            <PhotoGroup duplicate />
          </div>
        </div>
      </div>
    </section>
  );
}
