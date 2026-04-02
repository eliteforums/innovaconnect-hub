import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "HOME", href: "/" },
  { label: "ABOUT", href: "#about" },
  { label: "TRACKS", href: "#domains" },
  { label: "SPONSORS", href: "#sponsors" },
  { label: "FAQ", href: "#faq" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full border-b-2 border-foreground sticky top-0 z-50 bg-background">
      {/* Top bar */}
      <div className="border-b border-border px-4 py-1 flex items-center justify-between text-xs tracking-widest uppercase text-muted-foreground">
        <span>EST. 2025</span>
        <span>BY ELITE FORUMS</span>
        <span className="hidden sm:inline">NATIONAL LEVEL</span>
      </div>

      {/* Main nav */}
      <div className="flex items-center justify-between px-4 md:px-8 py-3">
        <Link to="/" className="text-xl md:text-2xl font-black tracking-tighter uppercase">
          INNOVA<span className="text-editorial-pink">HACK</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-bold tracking-widest uppercase text-foreground hover:text-editorial-blue transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/register"
            className="border-2 border-foreground px-5 py-2 text-xs font-black uppercase tracking-wider hover:bg-foreground hover:text-background transition-all"
          >
            REGISTER NOW
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t-2 border-foreground">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-6 py-3 text-sm font-bold uppercase tracking-widest border-b border-border hover:bg-secondary transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/register"
            onClick={() => setOpen(false)}
            className="block px-6 py-3 text-sm font-black uppercase tracking-widest bg-editorial-pink text-foreground"
          >
            REGISTER NOW →
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
