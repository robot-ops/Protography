import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function Footer() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Auto-fill Name and Email from authenticated user
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setMessage('');
    setTimeout(() => {
      setIsSubmitted(false);
    }, 4000);
  };

  return (
    <footer id="contact" className="bg-card border-t border-border-ui pt-12 sm:pt-16 pb-8 mt-12 sm:mt-20">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between gap-8 pb-8 border-b border-border-ui">
          {/* Brand */}
          <div className="max-w-[350px]">
            <a href="#top" className="text-xl sm:text-2xl font-bold tracking-tight">
              Proto<span className="text-primary">graphy</span>
            </a>
            <p className="text-muted mt-2 text-sm leading-relaxed">
              Preserving fleeting moments into timeless visual stories.
            </p>
          </div>

          {/* Contact Form */}
          <div className="w-full sm:max-w-[360px]">
            <h3 className="text-lg sm:text-xl font-bold mb-4">
              Contact <span className="text-primary">Me</span>
            </h3>

            {isSubmitted && (
              <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded">
                Message sent successfully!
              </div>
            )}

            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                required
                className="w-full p-2.5 border border-border-ui rounded text-sm bg-white"
              />
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email"
                required
                className="w-full p-2.5 border border-border-ui rounded text-sm bg-white"
              />
              <textarea
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your Message"
                required
                className="w-full p-2.5 border border-border-ui rounded text-sm min-h-[80px] bg-white resize-y"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded text-sm hover:opacity-90 self-start transition-opacity"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between pt-6 text-muted text-xs sm:text-sm gap-2 text-center sm:text-left">
          <p>&copy; 2026 Protography. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
