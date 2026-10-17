export function Hero() {
  return (
    <section
      id="home"
      className="min-h-[60vh] sm:min-h-[70vh] flex flex-col justify-center items-center text-center px-4 sm:px-6 py-12 sm:py-16"
      style={{
        background: `linear-gradient(rgba(244, 247, 246, 0.9), rgba(244, 247, 246, 0.9)), url('/images/hero-bg.jpg') center/cover no-repeat`
      }}
    >
      <h1 className="text-2xl sm:text-4xl md:text-5xl mb-4 font-normal leading-tight">
        <em>Visual Stories Told Through Light &amp; Emotion.</em>
      </h1>

      <p className="text-muted text-sm sm:text-base mb-8 max-w-[600px] leading-relaxed">
        Exploring the world through honest perspectives — turning fleeting moments into timeless visual memories.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
        <a
          href="#portfolio"
          className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded text-center hover:opacity-90 transition-opacity"
        >
          View My Work
        </a>
        <a
          href="#contact"
          className="w-full sm:w-auto px-6 py-3 bg-card text-text-main border border-border-ui rounded text-center hover:bg-gray-50 transition-colors"
        >
          Get In Touch
        </a>
      </div>
    </section>
  );
}