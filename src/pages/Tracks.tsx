import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const tracks = [
  {
    name: "GENERATIVE AI",
    tag: "AI/ML",
    color: "border-editorial-purple",
    accent: "text-editorial-purple",
    bgAccent: "bg-editorial-purple",
    description:
      "Build the next wave of AI-powered applications. From LLMs to creative AI — push the boundaries of what machines can create.",
    sponsors: "AI and software firms",
    examples: [
      "AI-powered content generation platforms",
      "Intelligent automation tools",
      "Creative AI applications (art, music, writing)",
      "LLM-based enterprise solutions",
      "AI agents and assistants",
    ],
    sponsorTypes: [
      "AI Research Labs",
      "Software Companies",
      "Cloud Providers",
      "AI Startups",
      "Tech Giants",
    ],
  },
  {
    name: "FINTECH",
    tag: "FINANCE",
    color: "border-editorial-blue",
    accent: "text-editorial-blue",
    bgAccent: "bg-editorial-blue",
    description:
      "Reinvent how money moves. Payments, lending, insurance, DeFi — build solutions that disrupt traditional finance.",
    sponsors: "Finance companies, Banks, Fintech startups",
    examples: [
      "Digital payment solutions",
      "Lending and credit platforms",
      "Insurance technology",
      "Personal finance management",
      "Regulatory compliance tools",
    ],
    sponsorTypes: [
      "Banks & NBFCs",
      "Payment Gateways",
      "Insurance Companies",
      "Fintech Startups",
      "Investment Firms",
    ],
  },
  {
    name: "HEALTHTECH",
    tag: "HEALTH",
    color: "border-editorial-green",
    accent: "text-editorial-green",
    bgAccent: "bg-editorial-green",
    description:
      "Technology that saves lives. Digital health, diagnostics, telemedicine — solve real problems in healthcare delivery.",
    sponsors: "Hospitals, Pharma companies, Insurance companies",
    examples: [
      "Telemedicine platforms",
      "AI-powered diagnostics",
      "Patient management systems",
      "Drug discovery tools",
      "Mental health applications",
    ],
    sponsorTypes: [
      "Hospitals & Clinics",
      "Pharmaceutical Companies",
      "Health Insurance Firms",
      "Medical Device Companies",
      "HealthTech Startups",
    ],
  },
  {
    name: "BLOCKCHAIN",
    tag: "WEB3",
    color: "border-editorial-orange",
    accent: "text-editorial-orange",
    bgAccent: "bg-editorial-orange",
    description:
      "Decentralize everything. Smart contracts, Web3, tokenization — build trustless systems for the future.",
    sponsors: "Blockchain and Web3 firms",
    examples: [
      "Decentralized applications (dApps)",
      "Smart contract platforms",
      "NFT and tokenization solutions",
      "DeFi protocols",
      "Supply chain on blockchain",
    ],
    sponsorTypes: [
      "Blockchain Protocols",
      "Web3 Startups",
      "Crypto Exchanges",
      "DeFi Platforms",
      "NFT Marketplaces",
    ],
  },
  {
    name: "STARTUP TRACK",
    tag: "OPEN INNOVATION",
    color: "border-editorial-pink",
    accent: "text-editorial-pink",
    bgAccent: "bg-editorial-pink",
    description:
      "Open innovation. Any idea, any domain. Build something that could become the next big startup. Impress investors and incubators.",
    sponsors: "Incubators, Accelerators, Investors",
    examples: [
      "Any innovative product or service",
      "Social impact solutions",
      "EdTech platforms",
      "Sustainability & CleanTech",
      "Any disruptive idea",
    ],
    sponsorTypes: [
      "Incubators",
      "Accelerators",
      "Angel Investors",
      "Venture Capital Firms",
      "Corporate Innovation Labs",
    ],
  },
];

const Tracks = () => {
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
              HACKATHON TRACKS
            </p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.85] tracking-tighter">
              CHOOSE YOUR
              <br />
              <span className="text-editorial-pink">ARENA</span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-sm md:text-base">
              5 domain tracks. Each with dedicated sponsors, mentors, and industry
              partners. Pick the track that matches your passion and build something
              extraordinary.
            </p>
          </motion.div>
        </div>

        {/* Track tags */}
        <div className="border-t border-border px-4 md:px-8 py-3 flex flex-wrap gap-2">
          {tracks.map((t) => (
            <span
              key={t.tag}
              className={`border-2 ${t.color} px-3 py-1 text-xs font-bold tracking-widest uppercase`}
            >
              {t.tag}
            </span>
          ))}
        </div>
      </section>

      {/* Track Details */}
      {tracks.map((track, i) => (
        <section key={track.name} className="border-b-2 border-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Track header */}
            <div className="border-b border-border px-4 md:px-8 py-6 flex items-end justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-12 ${track.bgAccent}`} />
                <div>
                  <p className={`text-xs font-bold tracking-[0.3em] uppercase ${track.accent} mb-1`}>
                    TRACK {String(i + 1).padStart(2, "0")} — {track.tag}
                  </p>
                  <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
                    {track.name}
                  </h2>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3">
              {/* Description */}
              <div className="border-b md:border-b-0 md:border-r border-border p-6 md:p-8">
                <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-3">
                  OVERVIEW
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {track.description}
                </p>
                <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-3">
                  BUILD IDEAS
                </p>
                <ul className="space-y-2">
                  {track.examples.map((ex) => (
                    <li key={ex} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className={`mt-1.5 w-1.5 h-1.5 ${track.bgAccent} shrink-0`} />
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sponsor types for this track */}
              <div className="border-b md:border-b-0 md:border-r border-border p-6 md:p-8">
                <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-3">
                  DOMAIN SPONSORS
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {track.sponsors}
                </p>
                <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-3">
                  SPONSOR CATEGORIES
                </p>
                <div className="space-y-3">
                  {track.sponsorTypes.map((type) => (
                    <div
                      key={type}
                      className={`border-2 ${track.color} px-4 py-3 flex items-center justify-center`}
                    >
                      <span className="text-xs font-bold tracking-widest uppercase">
                        {type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="p-6 md:p-8">
                <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-3">
                  WHAT SPONSORS GET
                </p>
                <div className="space-y-4">
                  {[
                    "Logo displayed on website & socials",
                    "Huge PR shoutout & reach to multiple audiences",
                    "Access to all participants for hiring (free after sponsorship)",
                    "Data and access to participant profiles",
                    "Brand visibility across all marketing channels",
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-start gap-2">
                      <span className={`mt-1.5 w-1.5 h-1.5 ${track.bgAccent} shrink-0`} />
                      <p className="text-sm text-muted-foreground">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      ))}

      {/* CTA */}
      <section className="border-b-2 border-foreground">
        <motion.div
          className="px-4 md:px-8 py-16 md:py-24 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
            PICK YOUR
            <br />
            <span className="text-editorial-pink">TRACK</span>
          </h2>
          <p className="text-muted-foreground mt-6 max-w-lg mx-auto text-sm md:text-base">
            Register now and choose the domain that excites you the most.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link
              to="/register"
              className="bg-editorial-pink px-10 py-4 text-sm font-black uppercase tracking-wider text-background hover:opacity-90 transition-opacity"
            >
              REGISTER NOW →
            </Link>
            <Link
              to="/partner"
              className="border-2 border-foreground px-10 py-4 text-sm font-black uppercase tracking-wider hover:bg-foreground hover:text-background transition-all"
            >
              BECOME A SPONSOR
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Tracks;