import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { LikeButton } from './LikeButton';

const categories = ['All', 'Landscape', 'Portrait', 'Couples', 'Night City'];

export function Portfolio() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const [checkingOutId, setCheckingOutId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [likes, setLikes] = useState({});

  const fetchPortfolio = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/portfolio`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load portfolio items from server');
      }
      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error('Fetch portfolio error:', err);
      setError(err.message || 'Unable to connect to the backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [token]);

  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter((item) => item.category === selectedCategory);

  const handleToggleLike = (id) => {
    setLikes((prevLikes) => ({
      ...prevLikes,
      [id]: !prevLikes[id],
    }));
  };

  // Handle Stripe Checkout Session creation & redirect
  const handleBuyPrint = async (portfolioId) => {
    setCheckoutError(null);
    setCheckingOutId(portfolioId);

    try {
      const response = await fetch(`${API_URL}/api/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ portfolioId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create Stripe Checkout session');
      }

      if (data.url) {
        // Redirect browser to Stripe's hosted checkout page
        window.location.href = data.url;
      } else {
        throw new Error('Stripe checkout URL missing from response');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setCheckoutError(err.message || 'Payment initiation failed. Please try again.');
      setCheckingOutId(null);
    }
  };

  return (
    <section id="portfolio" className="max-w-[1100px] mx-auto my-12 sm:my-20 px-4 sm:px-6">
      <h2 className="text-2xl sm:text-3xl text-center mb-2 sm:mb-3 font-normal">Fine Art Gallery</h2>
      <p className="text-center text-xs sm:text-sm text-muted mb-6 sm:mb-8 max-w-md mx-auto">
        Curated visual studies available as archival museum-grade photo prints. Order directly with secure checkout.
      </p>

      {/* Category Filter Buttons */}
      <div className="flex justify-center gap-2 mb-6 sm:mb-8 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium border transition-colors ${
              selectedCategory === cat
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-card text-text-main border-border-ui hover:bg-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Checkout Error Alert */}
      {checkoutError && (
        <div className="mb-6 max-w-md mx-auto p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl text-center">
          <p className="font-semibold mb-1">Checkout Error</p>
          <p>{checkoutError}</p>
        </div>
      )}

      {/* Loading Photos */}
      {isLoading && (
        <div className="py-16 text-center text-muted">
          <div className="inline-block w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mb-3"></div>
          <p className="text-sm">Loading photography gallery from database...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="py-12 text-center">
          <p className="text-red-600 text-sm mb-3">{error}</p>
          <button
            type="button"
            onClick={fetchPortfolio}
            className="px-4 py-1.5 text-xs font-semibold bg-primary text-white rounded-md hover:opacity-90"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredItems.length === 0 && (
        <div className="py-12 text-center text-muted text-sm">
          No photos found in this category.
        </div>
      )}

      {/* Portfolio Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-border-ui rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="relative h-[210px] sm:h-[230px] w-full overflow-hidden bg-gray-100">
                <img
                  src={item.image}
                  alt={item.alt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />

                {/* Controlled Like Button */}
                <div className="absolute top-3 right-3">
                  <LikeButton
                    isLiked={likes[item.id] || false}
                    onToggle={() => handleToggleLike(item.id)}
                  />
                </div>

                {/* Category Badge */}
                <div className="absolute bottom-3 left-3">
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-black/60 text-white backdrop-blur-xs">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Card Details & Buy Button */}
              <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-text-main line-clamp-1">
                    {item.alt}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">Archival Fine Art Print</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border-ui">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted block tracking-wider">
                      Price
                    </span>
                    <span className="text-base font-bold text-primary font-mono">
                      ${((item.price || 1500) / 100).toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={checkingOutId === item.id}
                    onClick={() => handleBuyPrint(item.id)}
                    className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:opacity-90 active:scale-95 transition disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                  >
                    {checkingOutId === item.id ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Buy Print</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
