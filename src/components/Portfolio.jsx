import { useState } from 'react';
import { portfolioData } from '../data/portfolioData';
import { LikeButton } from './LikeButton';

const categories = ['All', 'Landscape', 'Portrait', 'Couples', 'Night City'];

export function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [likes, setLikes] = useState({});

  const filteredItems = selectedCategory === 'All'
    ? portfolioData
    : portfolioData.filter((item) => item.category === selectedCategory);

  const handleToggleLike = (id) => {
    setLikes((prevLikes) => ({
      ...prevLikes,
      [id]: !prevLikes[id],
    }));
  };

  return (
    <section id="portfolio" className="max-w-[1100px] mx-auto my-20 px-6">
      <h2 className="text-3xl text-center mb-8">My Work</h2>

      {/* Category Filter Buttons */}
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded text-sm font-medium border transition-colors ${
              selectedCategory === cat
                ? 'bg-primary text-white border-primary'
                : 'bg-card text-text-main border-border-ui hover:bg-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="relative bg-card border border-border-ui rounded-lg overflow-hidden h-[240px] group"
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
    </section>
  );
}