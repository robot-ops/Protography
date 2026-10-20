export function LikeButton({ isLiked, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isLiked ? "Unlike photo" : "Like photo"}
      className={`p-2 rounded-full backdrop-blur-xs transition-all duration-200 active:scale-90 ${
        isLiked
          ? 'bg-red-50 text-red-500 shadow-sm'
          : 'bg-white/80 text-gray-500 hover:text-red-500 hover:bg-white'
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="w-5 h-5 transition-transform"
        fill={isLiked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
