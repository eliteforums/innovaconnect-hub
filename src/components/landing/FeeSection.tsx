const FeeSection = () => {
  return (
    <section className="border-b-2 border-foreground">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="border-b md:border-b-0 md:border-r border-border p-8 md:p-16">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-2">
            SECTION 06
          </p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">
            WHY ₹100?
          </h2>
          <p className="text-7xl md:text-9xl font-black text-editorial-pink">₹100</p>
          <p className="text-xs tracking-widest uppercase text-muted-foreground mt-2">
            ONE-TIME COMMITMENT FEE
          </p>
        </div>

        <div className="p-8 md:p-16 flex flex-col justify-center">
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="font-black uppercase text-sm tracking-wider mb-1">
                SERIOUS APPLICANTS ONLY
              </h3>
              <p className="text-sm text-muted-foreground">
                We receive 10,000+ applications. The fee ensures every applicant is
                genuinely committed to participating and building something meaningful.
              </p>
            </div>
            <div className="border-b border-border pb-4">
              <h3 className="font-black uppercase text-sm tracking-wider mb-1">
                NOT A REVENUE MODEL
              </h3>
              <p className="text-sm text-muted-foreground">
                ₹100 doesn't cover our costs. It's a filter — a small commitment that
                dramatically improves the quality of our applicant pool.
              </p>
            </div>
            <div className="border-b border-border pb-4">
              <h3 className="font-black uppercase text-sm tracking-wider mb-1">
                WHAT YOU GET IN RETURN
              </h3>
              <p className="text-sm text-muted-foreground">
                Access to hiring companies, investor introductions, incubation
                opportunities, mentorship, and national recognition. The ROI is
                immeasurable.
              </p>
            </div>
            <div>
              <h3 className="font-black uppercase text-sm tracking-wider mb-1">
                REFUND POLICY
              </h3>
              <p className="text-sm text-muted-foreground">
                If your application is not shortlisted, the fee is fully refundable.
                Zero risk.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeeSection;
