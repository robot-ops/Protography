import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 py-12"
      style={{
        background: `linear-gradient(rgba(244, 247, 246, 0.82), rgba(244, 247, 246, 0.82)), url('/images/hero-bg.jpg') center/cover no-repeat`
      }}
    >
      {/* Brand Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Proto<span className="text-primary">graphy</span>
        </h1>
        <p className="text-sm text-muted mt-2 max-w-sm mx-auto">
          {isRegister
            ? 'Create an account to explore our visual stories and portfolio'
            : 'Visual Stories Told Through Light & Emotion — sign in to continue'}
        </p>
      </div>

      {/* Glassmorphism Auth Card */}
      <div className="w-full max-w-md bg-white/70 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl font-bold mb-4 text-center">
          {isRegister ? 'Sign Up' : 'Sign In'}
        </h2>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50/80 backdrop-blur-xs border border-red-200 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3.5 py-2.5 text-sm bg-white/80 border border-border-ui/80 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-primary focus:bg-white transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 text-sm bg-white/80 border border-border-ui/80 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-primary focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm bg-white/80 border border-border-ui/80 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-primary focus:bg-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-primary text-white font-semibold rounded-xl hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50 text-sm shadow-md"
          >
            {submitting ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="mt-6 text-center text-sm text-muted">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError('');
                }}
                className="text-primary font-semibold hover:underline"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError('');
                }}
                className="text-primary font-semibold hover:underline"
              >
                Create an account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
