import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const sponsorBenefits = [
  {
    title: "LOGO ON WEBSITE & SOCIALS",
    desc: "Your logo displayed prominently on our website and across all social media channels with a huge PR shoutout reaching multiple audiences.",
  },
  {
    title: "ACCESS TO ALL PARTICIPANTS",
    desc: "Companies that sponsor get free access to all participants for hiring. Direct access to India's top 1% builders — no recruitment fees.",
  },
  {
    title: "COMPLETE TRANSPARENCY",
    desc: "We provide data and access to all participants. Full transparency on reach, engagement, and participant profiles.",
  },
  {
    title: "BRAND VISIBILITY",
    desc: "Your brand featured across all marketing materials, event banners, social media campaigns, and participant communications.",
  },
];

const partnerTypes = [
  {
    type: "COMPANIES / SPONSORS",
    accent: "border-editorial-pink",
    bgAccent: "bg-editorial-pink",
    benefits: [
      "Logo displayed on website and socials with huge PR shoutout",
      "Access to ALL participants for hiring — completely FREE after sponsorship",
      "Assured hiring promise gives priority access to top talent",
      "Data and access to all participant profiles",
      "Brand visibility across all marketing channels and event materials",
      "Domain-specific sponsorship: EdTech for AI track, Pharma for HealthTech, Banks for FinTech, Web3 firms for Blockchain, VCs for Startup Track",
    ],
  },
  {
    type: "HIRING PARTNERS (WITHOUT SPONSORSHIP)",
    accent: "border-editorial-blue",
    bgAccent: "bg-editorial-blue",
    benefits: [
      "Companies can participate for hiring without sponsorship",
      "Must provide an assured hiring commitment",
      "Companies with sponsorship get priority hiring opportunities",
      "Access to pre-screened, top 1% talent pool",
      "Direct interaction with participants during Demo Day",
    ],
  },
  {
    type: "INVESTORS & INCUBATORS",
    accent: "border-editorial-purple",
    bgAccent: "bg-editorial-purple",
    benefits: [
      "Direct access to innovative startup ideas and prototypes",
      "First look at projects from the Startup Track (Open Innovation)",
      "Opportunity to offer incubation, acceleration, or investment",
      "Logo on Wall of Fame on our website",
      "Network with other investors and industry leaders",
      "Same benefits as sponsor companies for those who sponsor",
    ],
  },
  {
    type: "COLLEGE PARTNERS",
    accent: "border-editorial-green",
    bgAccent: "bg-editorial-green",
    benefits: [
      "Colleges assuring 50-70% crowd participation get 1 FREE industry professional session every semester with a MOU",
      "Access to Elite Forums community — hosts of many tech meetups and events",
      "Exposure on our website with logo on the College Partners Wall of Fame",
      "Guidance for upcoming startup ideas from students",
      "Access to our Job Database and HR connections for student placements",
      "Direct pipeline for students to participate in future hackathons",
    ],
    tiers: [
      {
        rank: "🥇 1st Place",
        target: "1,000+ Applications",
        reward: "₹20,000 INR sponsorship for their next event + highlighted on our website",
        accent: "bg-yellow-500/10 border-yellow-500",
      },
      {
        rank: "🥈 2nd Place",
        target: "825+ Applications",
        reward: "₹15,000 INR sponsorship for their next event + highlighted on our website",
        accent: "bg-gray-300/10 border-gray-400",
      },
      {
        rank: "🥉 3rd Place",
        target: "650+ Applications",
        reward: "₹10,000 INR sponsorship for their next event + highlighted on our website",
        accent: "bg-orange-500/10 border-orange-400",
      },
    ],
    tierNote: "Top 3 colleges with maximum participation will get sponsorship for their next event and will be highlighted on our website.",
  },
  {
    type: "COMMUNITY PARTNERS",
    accent: "border-editorial-orange",
    bgAccent: "bg-editorial-orange",
    benefits: [
      "Logo displayed on Community Partners Wall of Fame on our website",
      "Best community with maximum participants gets REWARDS",
      "Direct access to the hackathon for top-performing communities",
      "Communities helping with sponsorship get SPECIAL MENTIONS",
      "Cross-promotion across Elite Forums network",
      "Co-branding opportunities for future events",
    ],
    tiers: [
      {
        rank: "🥇 1st Place",
        target: "1,000+ Applications",
        reward: "Direct invite to event, Memento & Felicitation, Techy Gifts + Special Mention",
        accent: "bg-yellow-500/10 border-yellow-500",
      },
      {
        rank: "🥈 2nd Place",
        target: "825+ Applications",
        reward: "Direct invite to event, Memento, Swags + Special Mention",
        accent: "bg-gray-300/10 border-gray-400",
      },
      {
        rank: "🥉 3rd Place",
        target: "650+ Applications",
        reward: "Direct invite to event, Memento + Special Mention",
        accent: "bg-orange-500/10 border-orange-400",
      },
    ],
    tierNote: "Top 3 communities with maximum participation receive exclusive rewards and recognition.",
  },
];

const Partner = () => {
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
              PARTNERSHIPS
            </p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.85] tracking-tighter">
              PARTNER
              <br />
              <span className="text-editorial-pink">WITH US</span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-sm md:text-base">
              Join India's largest hiring & startup hackathon as a partner. Whether
              you're a company, investor, college, or community — there's a partnership
              tier designed for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Partner */}
      <section className="border-b-2 border-foreground">
        <div className="border-b border-border px-4 md:px-8 py-6">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-1">
            VALUE PROPOSITION
          </p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            WHY PARTNER?
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {sponsorBenefits.map((item, i) => (
            <motion.div
              key={item.title}
              className="border-b border-r border-border p-8 md:p-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <span className="text-5xl font-black text-muted-foreground/20">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-xl font-black uppercase tracking-tight mt-2 mb-3">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Partner Types */}
      {partnerTypes.map((partner, idx) => (
        <section key={partner.type} className="border-b-2 border-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className={`border-b border-border px-4 md:px-8 py-6 flex items-center gap-4`}>
              <div className={`w-3 h-12 ${partner.bgAccent}`} />
              <div>
                <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-1">
                  TIER {String(idx + 1).padStart(2, "0")}
                </p>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
                  {partner.type}
                </h2>
              </div>
            </div>

            {/* Tiered Rewards Section for College & Community Partners */}
            {"tiers" in partner && partner.tiers && (
              <div className="px-6 md:px-8 lg:px-12 pt-8">
                <div className="border-2 border-foreground p-6 md:p-8 mb-2">
                  <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-pink mb-2">
                    🏆 TOP PERFORMER REWARDS
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    {partner.tierNote}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {partner.tiers.map((tier) => (
                      <div
                        key={tier.rank}
                        className={`border-2 ${tier.accent} p-5 rounded-sm`}
                      >
                        <p className="text-lg font-black uppercase tracking-tight mb-1">
                          {tier.rank}
                        </p>
                        <p className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-3">
                          {tier.target}
                        </p>
                        <p className="text-sm text-foreground leading-relaxed font-medium">
                          {tier.reward}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 md:p-8 lg:p-12">
              {"tiers" in partner && partner.tiers && (
                <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-4">
                  BENEFITS FOR ALL PARTNERS
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partner.benefits.map((benefit, i) => (
                  <div
                    key={i}
                    className={`border-2 ${partner.accent} p-4 md:p-6`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-1 w-2 h-2 ${partner.bgAccent} shrink-0`} />
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {benefit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      ))}

      {/* Domain-specific Sponsors Breakdown */}
      <section className="border-b-2 border-foreground">
        <div className="border-b border-border px-4 md:px-8 py-6">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-1">
            DOMAIN SPONSORS
          </p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            SPONSOR BY TRACK
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5">
          {[
            {
              track: "GEN AI",
              sponsors: "EdTech Companies, AI & Software Firms",
              accent: "border-editorial-purple",
              textAccent: "text-editorial-purple",
            },
            {
              track: "HEALTHTECH",
              sponsors: "Hospitals, Pharma, Insurance Companies",
              accent: "border-editorial-green",
              textAccent: "text-editorial-green",
            },
            {
              track: "FINTECH",
              sponsors: "Banks, Finance Companies, Fintech Startups",
              accent: "border-editorial-blue",
              textAccent: "text-editorial-blue",
            },
            {
              track: "BLOCKCHAIN",
              sponsors: "Blockchain & Web3 Firms",
              accent: "border-editorial-orange",
              textAccent: "text-editorial-orange",
            },
            {
              track: "STARTUP",
              sponsors: "Incubators, Accelerators, Investors",
              accent: "border-editorial-pink",
              textAccent: "text-editorial-pink",
            },
          ].map((item) => (
            <div
              key={item.track}
              className={`border-b md:border-b-0 md:border-r border-border p-6 md:p-8 last:border-r-0 border-t-4 ${item.accent}`}
            >
              <p className={`text-sm font-black uppercase tracking-wider ${item.textAccent} mb-3`}>
                {item.track}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.sponsors}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
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
            PARTNER?
          </h2>
          <p className="text-muted-foreground mt-6 max-w-lg mx-auto text-sm md:text-base">
            Reach out to us to discuss partnership opportunities. We're transparent,
            flexible, and committed to creating value for every partner.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <a
              href="mailto:partnerships@eliteforums.in"
              className="bg-editorial-pink px-10 py-4 text-sm font-black uppercase tracking-wider text-background hover:opacity-90 transition-opacity"
            >
              EMAIL US →
            </a>
            <Link
              to="/sponsors"
              className="border-2 border-foreground px-10 py-4 text-sm font-black uppercase tracking-wider hover:bg-foreground hover:text-background transition-all"
            >
              VIEW SPONSORS
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Partner;
