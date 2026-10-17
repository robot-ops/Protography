export function Header() {
  return (
    <header className="sticky top-0 bg-white border-b border-border-ui z-50">
      <div className="max-w-[1100px] mx-auto px-6 h-[70px] flex justify-between items-center">
        <a href="#top" className="text-2xl font-bold">
          Proto<span className="text-primary">graphy</span>
        </a>

        <nav>
          <ul className="flex gap-6">
            <li><a href="#home" className="text-primary font-bold">Home</a></li>
            <li><a href="#about" className="text-muted font-medium hover:text-primary">About</a></li>
            <li><a href="#portfolio" className="text-muted font-medium hover:text-primary">Portfolio</a></li>
            <li><a href="#contact" className="text-muted font-medium hover:text-primary">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}