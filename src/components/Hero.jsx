export function Hero() {
  return (
    <section
      id="home"
      className="min-h-[70vh] flex flex-col justify-center items-center text-center px-6 py-16"
      style={{
        background: `linear-gradient(rgba(244, 247, 246, 0.9), rgba(244, 247, 246, 0.9)), url('/images/hero-bg.jpg') center/cover no-repeat`
      }}
    >
      <h1 className="text-3xl sm:text-5xl mb-4 font-normal">
        <em>Visual Stories Told Through Light &amp; Emotion.</em>
      </h1>

      <p className="text-muted mb-8 max-w-[600px]">
        Exploring the world through honest perspectives — turning fleeting moments into timeless visual memories.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <a
          href="#portfolio"
          className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded text-center hover:opacity-90"
        >
          View My Work
        </a>
        <a
          href="#contact"
          className="w-full sm:w-auto px-6 py-3 bg-card text-text-main border border-border-ui rounded text-center hover:bg-gray-50"
        >
          Get In Touch
        </a>
      </div>
    </section>
  );
}