import Link from "next/link";
import { event } from "@/content/event";
import { footerNav } from "@/content/navigation";
import Image from "next/image";
import skyline from "@/assets/photos/footer-skyline.webp";
import { Container } from "@/components/ui";

export function SiteFooter() {
  const partnerEmail = event.contact.partnerships.value;
  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="relative aspect-[2172/497] min-h-[160px] w-full overflow-hidden bg-paper">
        <Image
          src={skyline}
          alt="Ink illustration of Mumbai: the Marine Drive skyline, the Gateway of India, the BMC headquarters, a taxi, a BEST bus, a local train and the Bandra–Worli Sea Link."
          fill
          sizes="100vw"
          className="object-cover object-[48%_50%]"
        />
      </div>
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_2fr]">
          <div className="@container min-w-0">
            <p className="kicker text-taxi">{event.announcement.join(" · ")}</p>
            <p className="headline mt-3 whitespace-nowrap text-[clamp(2.25rem,13.4cqw,6.5rem)] leading-[0.85] text-paper-white">
              INNOVAHACK
            </p>
            <p className="mt-4 max-w-md font-display text-xl italic text-paper/90">
              {event.tagline}
            </p>
            <p className="mt-6 text-sm text-paper/70">
              A national hackathon organized by {event.organizer}.
              {partnerEmail && (
                <>
                  {" "}Partnerships:{" "}
                  <a className="text-taxi underline underline-offset-4 hover:text-paper-white" href={`mailto:${partnerEmail}`}>
                    {partnerEmail}
                  </a>
                </>
              )}
            </p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerNav.map((group) => (
              <div key={group.title}>
                <p className="kicker border-b border-paper/25 pb-2 text-taxi">{group.title}</p>
                <ul className="mt-3 space-y-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-paper/85 hover:text-taxi">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-paper/25 pt-6 text-xs text-paper/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {event.organizer}. InnovaHack is organized by {event.organizer}.</p>
          <p className="kicker text-[0.625rem]">
            Illustrations are original artwork inspired by Mumbai · Not a news publication
          </p>
        </div>
      </Container>
    </footer>
  );
}
