import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const sponsorshipTiers = [
  {
    tier: "TITLE SPONSOR",
    price: "CUSTOM",
    accent: "border-editorial-pink",
    bgAccent: "bg-editorial-pink",
    textAccent: "text-editorial-pink",
    perks: [
      "Exclusive title branding across all materials",
      "Logo on website hero section & all pages",
      "Dedicated social media campaign with massive PR reach",
      "Priority access to ALL participant data for hiring",
      "Speaking slot at opening & closing ceremony",
      "Custom branded track or challenge",
      "First right of refusal for future events",
    ],
  },
  {
    tier: "GOLD SPONSOR",
    price: "CONTACT US",
    accent: "border-editorial-orange",
    bgAccent: "bg-editorial-orange",
    textAccent: "text-editorial-orange",
    perks: [
      "Logo on website sponsors section & socials",
      "Huge PR shoutout reaching multiple audiences",
      "Access to all participants for hiring — free after sponsorship",
      "Brand visibility across all marketing channels",
      "Booth space at the hackathon venue",
      "Mentorship opportunity during the hackathon",
    ],
  },
  {
    tier: "DOMAIN SPONSOR",
    price: "CONTACT US",
    accent: "border-editorial-purple",
    bgAccent: "bg-editorial-purple",
    textAccent: "text-editorial-purple",
    perks: [
      "Exclusive branding for a specific track (AI, FinTech, HealthTech, Blockchain, Startup)",
      "Logo on track-specific materials & website section",
      "Direct access to participants in your domain",
      "Opportunity to set a custom challenge for the track",
      "Data and profiles of track participants",
    ],
  },
  {
    tier: "TECH PARTNER",
    price: "IN-KIND / CUSTOM",
    accent: "border-editorial-blue",
    bgAccent: "bg-editorial-blue",
    textAccent: "text-editorial-blue",
    perks: [
      "Logo on website tech partners section",
      "Provide APIs, tools, or credits to participants",
      "Brand exposure to 10,000+ applicants",
      "Social media mentions & PR coverage",
      "Access to participant projects using your tech",
    ],
  },
  {
    tier: "EDUCATION PARTNER",
    price: "IN-KIND / CUSTOM",
    accent: "border-editorial-green",
    bgAccent: "bg-editorial-green",
    textAccent: "text-editorial-green",
    perks: [
      "Logo on website education partners section",
      "Offer courses, certifications, or scholarships to participants",
      "Brand visibility among 10,000+ student applicants",
      "Co-branded content and workshops",
      "Access to top talent for recruitment",
    ],
  },
];

const whySponsor = [
  {
    title: "10,000+ APPLICANTS",
    desc: "Your brand reaches over 10,000 ambitious builders, engineers, and entrepreneurs across India.",
    num: "01",
  },
  {
    title: "TOP 200–250 TEAMS TALENT",
    desc: "Direct access to the most talented builders in the country — pre-screened and ready to be hired.",
    num: "02",
  },
  {
    title: "MASSIVE PR & REACH",
    desc: "Your logo displayed across our website, social media, event materials, and press coverage with huge PR shoutouts.",
    num: "03",
  },
  {
    title: "HIRING PIPELINE",
    desc: "Companies that sponsor get free access to all participants for hiring. No recruitment fees, just direct access.",
    num: "04",
  },
  {
    title: "BRAND ASSOCIATION",
    desc: "Associate your brand with innovation, technology, and India's most elite hackathon event.",
    num: "05",
  },
  {
    title: "COMPLETE TRANSPARENCY",
    desc: "We provide data and access to all participants. Full transparency on reach, engagement, and participant profiles.",
    num: "06",
  },
];

const SponsorUs = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="border-b-2 border-foreground">
        <div className="px-4 md:px-8 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-2">
              SPONSORSHIP OPPORTUNITIES
            </p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.85] tracking-tighter">
              SPONSOR
              <br />
              <span className="text-editorial-pink">INNOVAHACK</span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-sm md:text-base">
              Put your brand in front of India's top 200–250 teams of builders. Sponsor
              InnovaHack and get unmatched visibility, hiring access, and PR
              coverage across our 10,000+ applicant pool.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                to="/contact"
                className="bg-editorial-pink px-8 py-3 text-sm font-black uppercase tracking-wider text-background hover:opacity-90 transition-opacity"
              >
                GET IN TOUCH →
              </Link>
              <Link
                to="/sponsors"
                className="border-2 border-foreground px-8 py-3 text-sm font-black uppercase tracking-wider hover:bg-foreground hover:text-background transition-all"
              >
                VIEW CURRENT SPONSORS
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Sponsor */}
      <section className="border-b-2 border-foreground">
        <div className="border-b border-border px-4 md:px-8 py-6">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-1">
            VALUE PROPOSITION
          </p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            WHY SPONSOR?
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {whySponsor.map((item, i) => (
            <motion.div
              key={item.title}
              className="border-b border-r border-border p-8 md:p-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <span className="text-4xl font-black text-muted-foreground/20">
                {item.num}
              </span>
              <h3 className="text-lg font-black uppercase tracking-tight mt-2 mb-3">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Sponsorship Tiers */}
      <section className="border-b-2 border-foreground">
        <div className="border-b border-border px-4 md:px-8 py-6">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-1">
            SPONSORSHIP TIERS
          </p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            CHOOSE YOUR TIER
          </h2>
        </div>

        {sponsorshipTiers.map((tier, idx) => (
          <motion.div
            key={tier.tier}
            className="border-b border-border"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <div className="flex items-center gap-4 px-4 md:px-8 py-5 border-b border-border">
              <div className={`w-3 h-10 ${tier.bgAccent}`} />
              <div className="flex-1">
                <p
                  className={`text-sm font-black uppercase tracking-wider ${tier.textAccent}`}
                >
                  {tier.tier}
                </p>
                <p className="text-xs text-muted-foreground">{tier.price}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 px-4 md:px-8 py-6">
              {tier.perks.map((perk, i) => (
                <div key={i} className={`border-2 ${tier.accent} p-4`}>
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1 w-2 h-2 ${tier.bgAccent} shrink-0`}
                    />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {perk}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </section>

      {/* How It Works */}
      <section className="border-b-2 border-foreground">
        <div className="border-b border-border px-4 md:px-8 py-6">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-1">
            PROCESS
          </p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            HOW TO SPONSOR
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4">
          {[
            {
              num: "01",
              title: "REACH OUT",
              desc: "Email us at sponsors@eliteforums.in or fill the contact form. Tell us about your company and goals.",
            },
            {
              num: "02",
              title: "CHOOSE TIER",
              desc: "Pick a sponsorship tier that aligns with your budget and objectives. We're flexible and open to custom packages.",
            },
            {
              num: "03",
              title: "CONFIRM",
              desc: "Finalize the sponsorship agreement. We'll add your logo to the website and start the PR campaign immediately.",
            },
            {
              num: "04",
              title: "ENGAGE",
              desc: "Get access to participants, attend the hackathon, hire talent, and enjoy massive brand visibility.",
            },
          ].map((step, i) => (
            <motion.div
              key={step.num}
              className="border-b md:border-b-0 md:border-r border-border p-6 md:p-8 last:border-r-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <span className="text-5xl font-black text-muted-foreground/20">
                {step.num}
              </span>
              <h3 className="text-lg font-black uppercase tracking-wide mt-2 mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-b-2 border-foreground">
        <motion.div
          className="px-4 md:px-8 py-16 md:py-24 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink mb-4">
            LET'S BUILD TOGETHER
          </p>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
            READY TO
            <br />
            SPONSOR?
          </h2>
          <p className="text-muted-foreground mt-6 max-w-lg mx-auto text-sm md:text-base">
            Get your brand in front of India's top 200–250 teams of builders. Contact us today
            to discuss sponsorship opportunities.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link
              to="/partner"
              className="bg-editorial-pink px-10 py-4 text-sm font-black uppercase tracking-wider text-background hover:opacity-90 transition-opacity"
            >
              PARTNER WITH US →
            </Link>
            <Link
              to="/sponsors"
              className="border-2 border-foreground px-10 py-4 text-sm font-black uppercase tracking-wider hover:bg-foreground hover:text-background transition-all"
            >
              VIEW CURRENT SPONSORS
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default SponsorUs;
