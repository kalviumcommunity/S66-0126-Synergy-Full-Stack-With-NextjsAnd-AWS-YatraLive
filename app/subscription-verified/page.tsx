/**
 * Email Subscription Verified Page
 */
'use client';

import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SubscriptionVerifiedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    async function verify() {
      try {
        const response = await fetch(`/api/subscriptions/verify?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Your email has been verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Network error. Please try again.');
      }
    }

    verify();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-slate-900">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verifying...</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Please wait while we verify your email
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Verified!</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                You'll now receive notifications about train delays and platform changes.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Verification Failed
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                The verification link may have expired. Please try subscribing again.
              </p>
            </>
          )}

          <div className="mt-8 flex gap-4">
            <Link
              href="/"
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Back Home
            </Link>
            {status === 'success' && (
              <Link
                href="/train"
                className="flex-1 rounded-lg border border-blue-600 px-4 py-2 font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:hover:bg-slate-800"
              >
                View Trains
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
