/**
 * Subscribe Button Component
 * Modal form for email subscription with validation
 */
'use client';

import { Mail, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface SubscribeButtonProps {
  className?: string;
  variant?: 'button' | 'inline';
}

export function SubscribeButton({ className = '', variant = 'button' }: SubscribeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Check your email for verification link');
        setEmail('');
        setTimeout(() => setIsOpen(false), 2000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Subscription failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setStatus('idle');
    setMessage('');
    setEmail('');
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Mail className="h-4 w-4" />
          Get Alerts
        </button>
        {isOpen && <Modal />}
      </div>
    );
  }

  function Modal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-slate-950">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Get Train Alerts</h2>
            <button
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {status === 'success' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4 dark:bg-green-950">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <p className="text-green-800 dark:text-green-200">
                  Subscription successful! Check your email for verification link.
                </p>
              </div>
            </div>
          ) : status === 'error' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 dark:bg-red-950">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <p className="text-red-800 dark:text-red-200">{message}</p>
              </div>
              <button
                onClick={() => setStatus('idle')}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium">You'll receive alerts for:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>Train delays &gt; 5 minutes</li>
                  <li>Platform changes</li>
                  <li>Major service disruptions</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 ${className}`}
      >
        <Mail className="h-4 w-4" />
        Get Alerts
      </button>
      {isOpen && <Modal />}
    </>
  );
}
