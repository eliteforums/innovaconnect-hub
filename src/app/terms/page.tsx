import { event } from "@/content/event";
import { LegalPage } from "@/components/layout/LegalPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "/terms",
  "Terms & Conditions",
  "Terms for using the InnovaHack Chapter 2 website.",
);

export default function TermsPage() {
  return (
    <LegalPage
      section="Terms"
      path="/terms"
      title="Terms & conditions."
      deck={`The terms for using the ${event.fullName} website.`}
      sections={[
        {
          title: "About this website",
          body: [
            `This website provides information about ${event.fullName}, organized by ${event.organizer}. Competition participation is governed by the official rules, which will be published separately.`,
          ],
        },
        {
          title: "Information on this site",
          body: [
            "Details marked as planned, proposed or to be announced may change. Only details marked as confirmed are final.",
            "Chapter 1 figures are historical. Figures marked “as advertised” were promoted before that event and are not records of cash paid out or funding invested.",
          ],
        },
        {
          title: "Your submissions",
          body: [
            "You agree to provide accurate information and to submit only information you are entitled to share.",
            "Automated, abusive or fraudulent submissions are not permitted and may be blocked.",
          ],
        },
        {
          title: "Design and imagery",
          body: [
            "The newspaper styling of this website is a design concept. It is not a news publication, and nothing on it is press coverage.",
            "Illustrations are original artwork inspired by Mumbai. Any photographs used are credited and licensed.",
          ],
        },
        {
          title: "Changes",
          body: ["These terms may be updated. The current version is always available on this page."],
        },
      ]}
    />
  );
}
