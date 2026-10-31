import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

export function SuccessPage() {
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pollCount, setPollCount] = useState(0);

  // Read order_id from query params
  const searchParams = new URLSearchParams(window.location.search);
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided in URL');
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    let timer = null;

    const checkOrderStatus = async () => {
      try {
        const authToken = token || localStorage.getItem('token');
        if (!authToken) {
          setError('Authentication required to view order details');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order information');
        }

        const data = await response.json();

        if (isMounted) {
          setOrder(data.order);
          setIsLoading(false);

          // If the order is still pending and we polled less than 6 times, check again in 1.5s
          // (Stripe webhook can take 1-2 seconds to arrive after the user is redirected)
          if (data.order.status === 'pending' && pollCount < 6) {
            timer = setTimeout(() => {
              setPollCount((prev) => prev + 1);
            }, 1500);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Order fetch error:', err);
          setError(err.message || 'Unable to load order status');
          setIsLoading(false);
        }
      }
    };

    checkOrderStatus();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [orderId, token, pollCount]);

  const handleBackToGallery = () => {
    window.location.href = '/';
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 py-12"
      style={{
        background: `linear-gradient(rgba(244, 247, 246, 0.88), rgba(244, 247, 246, 0.88)), url('/images/hero-bg.jpg') center/cover no-repeat`
      }}
    >
      <div className="w-full max-w-lg bg-white/90 backdrop-blur-md border border-border-ui/80 rounded-2xl shadow-xl p-6 sm:p-8 text-center animate-in fade-in duration-200">
        {/* Loading State */}
        {isLoading && (
          <div className="py-12">
            <div className="inline-block w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold tracking-tight mb-1">Verifying Payment...</h2>
            <p className="text-sm text-muted">Waiting for Stripe webhook confirmation</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="py-8">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-text-main">Order Lookup Failed</h2>
            <p className="text-sm text-red-600 mb-6">{error}</p>
            <button
              type="button"
              onClick={handleBackToGallery}
              className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:opacity-90 transition text-sm shadow-sm"
            >
              Return to Gallery
            </button>
          </div>
        )}

        {/* Success / Paid State */}
        {!isLoading && !error && order && (
          <div>
            {order.status === 'paid' ? (
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xs">
                <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}

            <h2 className="text-2xl font-bold tracking-tight mb-1 text-text-main">
              {order.status === 'paid' ? 'Payment Confirmed!' : 'Processing Payment...'}
            </h2>
            <p className="text-sm text-muted mb-6">
              {order.status === 'paid'
                ? `Thank you for your purchase. Order #${order.id} has been recorded and marked as paid.`
                : `We received your checkout session. Confirming webhook from Stripe... (Attempt ${pollCount + 1})`}
            </p>

            {/* Order Details Card */}
            <div className="bg-page border border-border-ui rounded-xl p-4 sm:p-5 text-left mb-6">
              <div className="flex items-center gap-4 pb-4 border-b border-border-ui">
                {order.item?.image && (
                  <img
                    src={order.item.image}
                    alt={order.item.alt}
                    className="w-20 h-20 rounded-lg object-cover border border-border-ui"
                  />
                )}
                <div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {order.item?.category || 'Photography'}
                  </span>
                  <h4 className="text-sm font-bold mt-1 text-text-main line-clamp-2">
                    {order.item?.alt || 'Fine Art Photo Print'}
                  </h4>
                  <p className="text-xs text-muted mt-0.5">Quantity: {order.item?.quantity || 1}</p>
                </div>
              </div>

              <div className="pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-muted">
                  <span>Order Number</span>
                  <span className="font-mono font-medium text-text-main">#{order.id}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Payment Status</span>
                  <span
                    className={`font-semibold capitalize px-2 py-0.5 rounded ${
                      order.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Date</span>
                  <span className="text-text-main">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-border-ui text-text-main">
                  <span>Total Paid</span>
                  <span className="text-primary font-mono text-base">
                    ${(order.totalAmount / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBackToGallery}
              className="w-full py-2.5 px-4 bg-primary text-white font-medium rounded-xl hover:opacity-90 active:scale-[0.99] transition text-sm shadow-sm"
            >
              Continue Exploring Gallery
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
