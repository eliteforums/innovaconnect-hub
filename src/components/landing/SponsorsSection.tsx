const categories = [
  "TITLE SPONSOR",
  "DOMAIN SPONSORS",
  "HIRING PARTNERS",
  "TECH PARTNERS",
  "EDUCATION PARTNERS",
  "COMMUNITY PARTNERS",
  "COLLEGE PARTNERS",
  "INCUBATORS & INVESTORS",
];

const SponsorsSection = () => {
  return (
    <section id="sponsors" className="border-b-2 border-foreground">
      <div className="border-b border-border px-4 md:px-8 py-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground mb-1">
              SECTION 05
            </p>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
              SPONSORS & PARTNERS
            </h2>
          </div>
          <a
            href="#"
            className="text-xs font-bold uppercase tracking-widest text-editorial-blue hover:underline hidden md:block"
          >
            BECOME A PARTNER →
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat) => (
          <div
            key={cat}
            className="border-b border-r border-border p-6 md:p-8 flex flex-col items-center justify-center min-h-[160px] hover:bg-secondary/30 transition-colors"
          >
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-4">
              {cat}
            </p>
            <div className="w-20 h-20 border-2 border-dashed border-border rounded flex items-center justify-center">
              <span className="text-xs text-muted-foreground">LOGO</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SponsorsSection;
