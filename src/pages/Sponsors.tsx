import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const trackSponsors = [
  {
    track: "EDTECH — GENERATIVE AI TRACK",
    accent: "border-editorial-purple",
    bgAccent: "bg-editorial-purple",
    textAccent: "text-editorial-purple",
    description: "EdTech companies powering the AI track",
    slots: 6,
  },
  {
    track: "HEALTHTECH TRACK",
    accent: "border-editorial-green",
    bgAccent: "bg-editorial-green",
    textAccent: "text-editorial-green",
    description: "Hospitals, Pharma companies, Insurance companies",
    slots: 6,
  },
  {
    track: "FINTECH TRACK",
    accent: "border-editorial-blue",
    bgAccent: "bg-editorial-blue",
    textAccent: "text-editorial-blue",
    description: "Finance companies, Banks, Fintech startups",
    slots: 6,
  },
  {
    track: "BLOCKCHAIN TRACK",
    accent: "border-editorial-orange",
    bgAccent: "bg-editorial-orange",
    textAccent: "text-editorial-orange",
    description: "Blockchain and Web3 firms",
    slots: 6,
  },
  {
    track: "STARTUP TRACK (OPEN INNOVATION)",
    accent: "border-editorial-pink",
    bgAccent: "bg-editorial-pink",
    textAccent: "text-editorial-pink",
    description: "Incubators, Accelerators, Investors",
    slots: 6,
  },
];

const otherCategories = [
  { name: "TITLE SPONSOR", slots: 1 },
  { name: "HIRING PARTNERS", slots: 8 },
  { name: "TECH PARTNERS", slots: 6 },
  { name: "EDUCATION PARTNERS", slots: 6 },
];

const Sponsors = () => {
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
              WALL OF FAME
            </p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.85] tracking-tighter">
              OUR
              <br />
              <span className="text-editorial-pink">SPONSORS</span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-sm md:text-base">
              The companies, organizations, and communities that make InnovaHack
              possible. Every sponsor gets their logo displayed on our website and
              socials with a huge PR shoutout and reach to multiple audiences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Title Sponsor & General Categories */}
      <section className="border-b-2 border-foreground">
        <div className="border-b border-border px-4 md:px-8 py-6">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-1">
            GENERAL PARTNERS
          </p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            PARTNERS & SPONSORS
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {otherCategories.map((cat) => (
            <div
              key={cat.name}
              className="border-b border-r border-border p-6 md:p-8"
            >
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-4">
                {cat.name}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {Array(cat.slots)
                  .fill(null)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="w-full aspect-square border-2 border-dashed border-border rounded flex items-center justify-center hover:border-editorial-pink transition-colors"
                    >
                      <span className="text-xs text-muted-foreground/50">LOGO</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Track-wise Sponsors Wall of Fame */}
      <section className="border-b-2 border-foreground">
        <div className="border-b border-border px-4 md:px-8 py-6">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-1">
            DOMAIN SPONSORS
          </p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            TRACK-WISE WALL OF FAME
          </h2>
        </div>

        {trackSponsors.map((track, idx) => (
          <motion.div
            key={track.track}
            className="border-b border-border"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <div className="flex items-center gap-4 px-4 md:px-8 py-4 border-b border-border">
              <div className={`w-3 h-8 ${track.bgAccent}`} />
              <div>
                <p className={`text-sm font-black uppercase tracking-wider ${track.textAccent}`}>
                  {track.track}
                </p>
                <p className="text-xs text-muted-foreground">{track.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 px-4 md:px-8 py-6 gap-4">
              {Array(track.slots)
                .fill(null)
                .map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square border-2 border-dashed ${track.accent} rounded flex items-center justify-center hover:bg-secondary/30 transition-colors`}
                  >
                    <span className="text-xs text-muted-foreground/50">LOGO</span>
                  </div>
                ))}
            </div>
          </motion.div>
        ))}
      </section>

      {/* College Partners Wall of Fame */}
      <section className="border-b-2 border-foreground">
        <div className="border-b border-border px-4 md:px-8 py-6">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-blue mb-1">
            WALL OF FAME
          </p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            COLLEGE PARTNERS
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Colleges that partner with InnovaHack and drive participation from their
            campuses.
          </p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 px-4 md:px-8 py-8 gap-4">
          {Array(16)
            .fill(null)
            .map((_, i) => (
              <div
                key={i}
                className="aspect-square border-2 border-dashed border-editorial-blue rounded flex items-center justify-center hover:bg-secondary/30 transition-colors"
              >
                <span className="text-xs text-muted-foreground/50">LOGO</span>
              </div>
            ))}
        </div>
      </section>

      {/* Community Partners Wall of Fame */}
      <section className="border-b-2 border-foreground">
        <div className="border-b border-border px-4 md:px-8 py-6">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-green mb-1">
            WALL OF FAME
          </p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            COMMUNITY PARTNERS
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Communities that help spread the word and drive participation. The best
            community with maximum participants gets rewards and direct access to the
            hackathon. Communities helping with sponsorship get special mentions.
          </p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 px-4 md:px-8 py-8 gap-4">
          {Array(16)
            .fill(null)
            .map((_, i) => (
              <div
                key={i}
                className="aspect-square border-2 border-dashed border-editorial-green rounded flex items-center justify-center hover:bg-secondary/30 transition-colors"
              >
                <span className="text-xs text-muted-foreground/50">LOGO</span>
              </div>
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
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">
            WANT YOUR LOGO
            <br />
            <span className="text-editorial-pink">HERE?</span>
          </h2>
          <p className="text-muted-foreground mt-6 max-w-lg mx-auto text-sm md:text-base">
            Partner with InnovaHack and get your brand in front of India's top 1%
            builders.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link
              to="/partner"
              className="bg-editorial-pink px-10 py-4 text-sm font-black uppercase tracking-wider text-background hover:opacity-90 transition-opacity"
            >
              BECOME A PARTNER →
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Sponsors;