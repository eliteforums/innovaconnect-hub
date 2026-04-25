import { motion } from "framer-motion";

const roiBenefits = [
  {
    benefit: "Certificate of Participation",
    value: "Priceless",
    icon: "🎓",
  },
  {
    benefit: "Workshops & Mentorship Sessions",
    value: "₹5,000+",
    icon: "🧑‍🏫",
  },
  {
    benefit: "Hiring Exposure & Fast-Track Interviews",
    value: "₹10,000+",
    icon: "💼",
  },
  {
    benefit: "Investor Introductions & Pitch Access",
    value: "₹25,000+",
    icon: "🚀",
  },
  {
    benefit: "Startup Incubation & Funding Up to ₹50 Lakhs+",
    value: "₹5,000+",
    icon: "🏢",
  },
  {
    benefit: "National Recognition & Media Features",
    value: "Priceless",
    icon: "🏆",
  },
];

const FeeSection = () => {
  return (
    <section className="border-b-2 border-foreground">
      {/* Section Header */}
      <div className="border-b border-border px-4 md:px-8 py-6">
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-1">
          SECTION 06
        </p>
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
          REGISTRATION FEE
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Left - Fee + Location */}
        <div className="border-b lg:border-b-0 lg:border-r border-border p-8 md:p-12 flex flex-col justify-between">
          <div>
            <div className="mb-8">
              <p className="text-6xl md:text-7xl font-black text-editorial-pink">₹250</p>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mt-2">
                PER PERSON — FOR FINALISTS ONLY (NON-REFUNDABLE)
              </p>
              <div className="mt-4 border-2 border-editorial-green p-3">
                <p className="text-xs font-black uppercase tracking-wider text-editorial-green">
                  ✅ ROUND 1 IS COMPLETELY FREE
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  The ₹250 per person fee applies only to finalists in Round 2 (Offline/Hybrid round).
                </p>
              </div>
            </div>

            {/* Location Info */}
            <div className="border-2 border-foreground p-5 space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">📍</span>
                <div>
                  <h4 className="font-black uppercase text-sm tracking-wider">LOCATION</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">Mumbai, India</p>
                </div>
              </div>
              <div className="border-t border-border" />
              <div className="flex items-start gap-3">
                <span className="text-xl">🌐</span>
                <div>
                  <h4 className="font-black uppercase text-sm tracking-wider">MODE</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    <strong className="text-foreground">Round 1 (FREE):</strong> Fully Online — participate from anywhere
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong className="text-foreground">Round 2 (₹250/person):</strong> Offline/Hybrid — in-person in Mumbai or online
                  </p>
                </div>
              </div>
              <div className="border-t border-border" />
              <div className="flex items-start gap-3">
                <span className="text-xl">🚀</span>
                <div>
                  <h4 className="font-black uppercase text-sm tracking-wider">FUNDING</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Up to <strong className="text-foreground">₹50 Lakhs or More</strong> for Startup Ideas
                  </p>
                </div>
              </div>
              <div className="border-t border-border" />
              <div className="flex items-start gap-3">
                <span className="text-xl">⏱️</span>
                <div>
                  <h4 className="font-black uppercase text-sm tracking-wider">DURATION</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">30 Hours of Non-Stop Hacking</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle - ROI Breakdown */}
        <div className="border-b lg:border-b-0 lg:border-r border-border p-8 md:p-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-1 bg-editorial-green" />
            <h3 className="font-black uppercase text-sm tracking-wider text-editorial-green">
              YOUR ROI ON ₹250
            </h3>
          </div>

          <div className="space-y-0">
            {roiBenefits.map((item, i) => (
              <motion.div
                key={item.benefit}
                className="flex items-start justify-between py-3 border-b border-border last:border-b-0 gap-3"
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-lg flex-shrink-0 leading-none mt-0.5">{item.icon}</span>
                  <span className="text-xs md:text-sm font-bold uppercase tracking-wide break-words leading-snug">
                    {item.benefit}
                  </span>
                </div>
                <span className="text-sm font-black text-editorial-green flex-shrink-0 whitespace-nowrap">
                  {item.value}
                </span>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-6 border-2 border-editorial-green p-4 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">
              TOTAL VALUE YOU RECEIVE
            </p>
            <p className="text-3xl md:text-4xl font-black text-editorial-green">₹45,000+</p>
            <p className="text-xs tracking-widest uppercase text-muted-foreground mt-1">
              FOR JUST ₹250 — THAT&apos;S <span className="text-editorial-pink font-black">180x ROI</span>
            </p>
          </motion.div>
        </div>

        {/* Right - Why the fee + Policy */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="font-black uppercase text-sm tracking-wider mb-1">
                ROUND 1 IS FREE FOR EVERYONE
              </h3>
              <p className="text-sm text-muted-foreground">
                Anyone in India can participate in Round 1 (online) without paying a single rupee. Only the
                selected finalists who advance to Round 2 (Offline/Hybrid) are required to pay the ₹250 per
                person registration fee.
              </p>
            </div>
            <div className="border-b border-border pb-4">
              <h3 className="font-black uppercase text-sm tracking-wider mb-1">
                WHY ₹250 FOR FINALISTS?
              </h3>
              <p className="text-sm text-muted-foreground">
                The ₹250 per person fee is charged only to finalists qualifying for Round 2. It helps confirm
                in-person attendance, covers basic logistics for the offline event, and ensures every finalist
                is genuinely committed to participating in the Hybrid round.
              </p>
            </div>
            <div className="border-b border-border pb-4">
              <h3 className="font-black uppercase text-sm tracking-wider mb-1">
                EVERY FINALIST GETS REWARDED
              </h3>
              <p className="text-sm text-muted-foreground">
                Every finalist who pays the ₹250 registration fee receives guaranteed rewards — including a{" "}
                <strong className="text-foreground">Certificate of Participation</strong> and exclusive{" "}
                <strong className="text-foreground">access to workshops &amp; mentorship sessions</strong>{" "}
                with industry experts. On top of that, you get exposure to hiring companies, investor
                introductions, incubation opportunities, and national recognition.
              </p>
            </div>
            <div>
              <h3 className="font-black uppercase text-sm tracking-wider mb-1">
                FEE POLICY
              </h3>
              <p className="text-sm text-muted-foreground">
                The ₹250 per person registration fee (for Round 2 finalists) is non-refundable. Round 1 remains
                completely free for all applicants.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeeSection;