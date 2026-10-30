import { event } from "@/content/event";
import { LegalPage } from "@/components/layout/LegalPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "/privacy",
  "Privacy Notice",
  "What information the InnovaHack Chapter 2 website collects through its forms, and how it is used.",
);

export default function PrivacyPage() {
  return (
    <LegalPage
      section="Privacy"
      path="/privacy"
      title="Privacy notice."
      deck={`How ${event.organizer} handles the information you share through this website.`}
      sections={[
        {
          title: "Who we are",
          body: [`This website is operated by ${event.organizer}, the organizer of ${event.fullName}.`],
        },
        {
          title: "What we collect",
          body: [
            "We only collect what you enter into a form:",
            [
              "Event updates: your name, email, and optionally your college or organization and area of interest.",
              "Registration (when open): team lead contact details, city and state, team name, team members' names and emails, your chosen domain, project details and optional links.",
              "Partnership inquiries: your organization, name, role, business email and the details of your inquiry.",
              "Contact messages: your name, email, topic and message.",
            ],
            "We do not ask for sensitive personal information such as identity documents, financial details or health information.",
          ],
        },
        {
          title: "How we use it",
          body: [
            "Your information is used to send the updates you asked for, to run the competition, to respond to your inquiry, and to keep the forms secure (for example, rate limiting repeated submissions).",
            "Team leads must have their team members' permission before sharing their details.",
          ],
        },
        {
          title: "Who can see it",
          body: [
            "Submissions are stored privately and are only accessible to the organizing team. They are never shown publicly on this website.",
            "If information is to be shared with partners — for example for hiring or mentoring — that will be stated clearly in the official rules and asked for separately.",
          ],
        },
        {
          title: "Email",
          body: [
            "Update emails are sent only when there is official news. Every update email will include a way to unsubscribe.",
          ],
        },
        {
          title: "Your choices",
          body: [
            "You can ask us to access, correct or delete your information, or to stop sending you updates, at any time using the contact page.",
          ],
        },
        {
          title: "Retention",
          body: [
            "We keep submissions only as long as needed for the purpose they were collected for, after which they will be deleted. The specific retention period will be confirmed before launch.",
          ],
        },
      ]}
    />
  );
}
