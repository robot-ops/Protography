import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Portfolio } from './components/Portfolio';
import { Footer } from './components/Footer';
import { SuccessPage } from './components/SuccessPage';

function AppContent() {
  const { user, isLoading } = useAuth();

  // Check if current URL is the Stripe Checkout Success page
  const isSuccessRoute =
    window.location.pathname.startsWith('/success') ||
    window.location.search.includes('order_id');

  if (isSuccessRoute) {
    return <SuccessPage />;
  }

  // 1. Show loading spinner while checking existing session
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f7f6]">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-muted">Checking authentication...</p>
      </div>
    );
  }

  // 2. If not authenticated, show full Login Page
  if (!user) {
    return <LoginPage />;
  }

  // 3. Once logged in, show the full Protography website
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
