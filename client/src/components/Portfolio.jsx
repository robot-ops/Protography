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

  return (
    <section id="portfolio" className="max-w-[1100px] mx-auto my-12 sm:my-20 px-4 sm:px-6">
      <h2 className="text-2xl sm:text-3xl text-center mb-6 sm:mb-8 font-normal">My Work</h2>

      {/* Category Filter Buttons */}
      <div className="flex justify-center gap-2 mb-6 sm:mb-8 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 sm:px-4 py-1.5 rounded text-xs sm:text-sm font-medium border transition-colors ${
              selectedCategory === cat
                ? 'bg-primary text-white border-primary'
                : 'bg-card text-text-main border-border-ui hover:bg-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="relative bg-card border border-border-ui rounded-lg overflow-hidden h-[220px] sm:h-[240px]"
            >
              <img
                src={item.image}
                alt={item.alt}
                loading="lazy"
                className="w-full h-full object-cover"
              />

              {/* Controlled Like Button */}
              <div className="absolute top-3 right-3">
                <LikeButton
                  isLiked={likes[item.id] || false}
                  onToggle={() => handleToggleLike(item.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
