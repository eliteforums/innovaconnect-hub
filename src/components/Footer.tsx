const Footer = () => {
  return (
    <footer className="px-4 md:px-8 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm font-black uppercase tracking-wider">
          INNOVA<span className="text-editorial-pink">HACK</span> © 2026
        </p>
        <p className="text-xs text-muted-foreground tracking-widest uppercase">
          ORGANIZED BY ELITE FORUMS
        </p>
        <div className="flex gap-6">
          {["TWITTER", "LINKEDIN", "INSTAGRAM"].map((s) => (
            <a
              key={s}
              href="#"
              className="text-xs font-bold tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              {s}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
