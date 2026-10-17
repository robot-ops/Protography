import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Portfolio } from './components/Portfolio';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-[#f4f7f6] text-[#222222] overflow-x-hidden">
      <Header />
      <main id="main-content">
        <Hero />
        <About />
        <Portfolio />
      </main>
      <Footer />
    </div>
  );
}

export default App;
