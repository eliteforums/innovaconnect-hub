import Link from "next/link";
import { getSiteContent } from "@/lib/content";
import { t } from "@/lib/site";
import { ContentImage } from "@/components/media/ContentImage";
import { Container, Rich } from "@/components/ui";

export async function SiteFooter() {
  const c = await getSiteContent();
  const f = c.copy.global.footer;
  const partnerEmail = c.event.contact.partnerships.value;
  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="relative aspect-[2172/497] min-h-[160px] w-full overflow-hidden bg-paper">
        <ContentImage
          src={c.images.footerSkyline}
          alt={f.skylineAlt}
          fill
          sizes="100vw"
          className="object-cover object-[48%_50%]"
        />
      </div>
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_2fr]">
          <div className="@container min-w-0">
            <p className="kicker text-taxi">{c.event.announcement.join(" · ")}</p>
            <p className="headline mt-3 whitespace-nowrap text-[clamp(2.25rem,13.4cqw,6.5rem)] leading-[0.85] text-paper-white">
              {f.wordmark}
            </p>
            <p className="mt-4 max-w-md font-display text-xl italic text-paper/90">{c.event.tagline}</p>
            <p className="mt-6 text-sm text-paper/70">
              {t(c, f.organizedBy)}
              {partnerEmail && (
                <>
                  {" "}
                  {f.partnershipsLabel}{" "}
                  <a className="text-taxi underline underline-offset-4 hover:text-paper-white" href={`mailto:${partnerEmail}`}>
                    {partnerEmail}
                  </a>
                </>
              )}
            </p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {c.navigation.footer.map((group) => (
              <div key={group.title}>
                <p className="kicker border-b border-paper/25 pb-2 text-taxi">{group.title}</p>
                <ul className="mt-3 space-y-2">
                  {group.links.map((link) => (
                    <li key={`${link.href}-${link.label}`}>
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
          <p>
            <Rich text={t(c, f.copyright)} accent="text-taxi" />
          </p>
          <p className="kicker text-[0.625rem]">{f.note}</p>
        </div>
      </Container>
    </footer>
  );
}
