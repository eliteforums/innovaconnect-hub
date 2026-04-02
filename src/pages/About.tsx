import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const stats = [
  { number: "10,000+", label: "APPLICANTS EXPECTED" },
  { number: "TOP 1%", label: "SELECTED BUILDERS" },
  { number: "30 HRS", label: "NON-STOP HACKING" },
  { number: "5", label: "DOMAIN TRACKS" },
  { number: "₹100", label: "COMMITMENT FEE" },
  { number: "100+", label: "HIRING COMPANIES" },
];

const About = () => {
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
              ABOUT
            </p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.85] tracking-tighter">
              THE
              <br />
              <span className="text-editorial-pink">MISSION</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* What is InnovaHack */}
      <section className="border-b-2 border-foreground">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="border-b md:border-b-0 md:border-r border-border p-8 md:p-16">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-blue mb-4">
              WHAT IS INNOVAHACK?
            </p>
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-6">
              INDIA'S LARGEST HIRING & STARTUP HACKATHON
            </h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                InnovaHack is not just another hackathon — it's a curated, elite-level
                innovation event where the top 1% of India's builders come together to
                hack, get hired, and get funded.
              </p>
              <p>
                Over 30 intense hours, selected participants build real solutions across
                5 cutting-edge domains: Generative AI, FinTech, HealthTech, Blockchain,
                and an Open Startup Track.
              </p>
              <p>
                What makes InnovaHack different? Every finalist gets direct access to
                hiring companies, investors, and incubators. This isn't about prizes —
                it's about life-changing opportunities: job offers, internships,
                incubation, and investment.
              </p>
            </div>
          </div>

          <div className="p-8 md:p-16 flex flex-col justify-center">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-editorial-purple mb-4">
              ORGANIZED BY
            </p>
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-6">
              ELITE FORUMS
            </h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Elite Forums is a community-driven organization that has hosted numerous
                tech meetups, hackathons, and industry events across India. We connect
                builders with opportunities.
              </p>
              <p>
                Our mission is to bridge the gap between talent and opportunity. Through
                InnovaHack, we bring together the best minds, the most innovative
                companies, and the boldest investors — all under one roof.
              </p>
              <p>
                We believe in transparency, community, and creating real impact. Every
                partner, sponsor, and participant gets genuine value from being part of
                the InnovaHack ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b-2 border-foreground">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="border-b border-r border-border p-6 md:p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <p className="text-3xl md:text-4xl font-black text-editorial-pink">
                {stat.number}
              </p>
              <p className="text-xs tracking-widest text-muted-foreground mt-2">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Transparency Promise */}
      <section className="border-b-2 border-foreground">
        <div className="px-4 md:px-8 py-6 border-b border-border">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-1">
            OUR PROMISE
          </p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            TRANSPARENCY FIRST
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3">
          {[
            {
              title: "DATA ACCESS",
              desc: "We assure complete transparency with all partners and sponsors. They will receive data and access to all participants who consent to sharing their profiles.",
              accent: "border-editorial-blue",
            },
            {
              title: "REAL OPPORTUNITIES",
              desc: "Every finalist gets genuine benefits — job offers, internships, incubation opportunities, and investor introductions. No empty promises.",
              accent: "border-editorial-green",
            },
            {
              title: "COMMUNITY DRIVEN",
              desc: "Built by the community, for the community. Elite Forums has a track record of hosting impactful tech events and creating lasting connections.",
              accent: "border-editorial-purple",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              className={`border-b border-r border-border p-8 md:p-12 border-l-4 ${item.accent}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <h3 className="text-xl font-black uppercase tracking-tight mb-3">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why ₹100 */}
      <section className="border-b-2 border-foreground">
        <div className="px-4 md:px-8 py-6 border-b border-border">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-1">
            PARTICIPANT FEE
          </p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            WHY ₹100?
          </h2>
        </div>
        <div className="p-8 md:p-16 max-w-4xl mx-auto">
          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <p>
              Participants pay a small ₹100 commitment fee because we assure that the
              finalists will get <span className="text-foreground font-bold">huge benefits</span> —
              job offers, internships, incubation, investment, and more.
            </p>
            <p>
              This fee filters out casual applicants and ensures every participant in
              the final hackathon is genuinely committed to building something
              meaningful. It's not a revenue model — it's a quality filter.
            </p>
            <p>
              If your application is not shortlisted, the fee is{" "}
              <span className="text-editorial-green font-bold">fully refundable</span>.
              Zero risk.
            </p>
          </div>
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
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
            JOIN THE
            <br />
            <span className="text-editorial-pink">MOVEMENT</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link
              to="/register"
              className="bg-editorial-pink px-10 py-4 text-sm font-black uppercase tracking-wider text-background hover:opacity-90 transition-opacity"
            >
              APPLY NOW →
            </Link>
            <Link
              to="/partner"
              className="border-2 border-foreground px-10 py-4 text-sm font-black uppercase tracking-wider hover:bg-foreground hover:text-background transition-all"
            >
              PARTNER WITH US
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default About;