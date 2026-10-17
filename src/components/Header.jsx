import { useState } from 'react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 bg-white/95 backdrop-blur-xs border-b border-border-ui z-50">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <div className="h-[70px] flex justify-between items-center">
          {/* Brand Logo */}
          <a href="#top" className="text-xl sm:text-2xl font-bold tracking-tight">
            Proto<span className="text-primary">graphy</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden sm:block">
            <ul className="flex gap-6 text-sm font-medium">
              <li>
                <a href="#home" className="text-primary font-bold">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="text-muted hover:text-primary transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#portfolio" className="text-muted hover:text-primary transition-colors">
                  Portfolio
                </a>
              </li>
              <li>
                <a href="#contact" className="text-muted hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="sm:hidden p-2 text-text-main hover:text-primary rounded-md focus:outline-hidden"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <nav className="sm:hidden py-3 border-t border-border-ui">
            <ul className="flex flex-col gap-3 text-sm font-medium">
              <li>
                <a
                  href="#home"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-1 text-primary font-bold"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-1 text-muted hover:text-primary"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#portfolio"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-1 text-muted hover:text-primary"
                >
                  Portfolio
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-1 text-muted hover:text-primary"
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}