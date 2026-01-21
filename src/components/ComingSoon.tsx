import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getComingSoonMessage } from '../config/contentStatus';

export const ComingSoon: React.FC = () => {
  const location = useLocation();
  const message = getComingSoonMessage(location.pathname);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Coming Soon
        </h1>

        {/* Message */}
        <p className="text-slate-600 mb-8 leading-relaxed">
          {message}
        </p>

        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        {/* Decorative line */}
        <div className="mt-12 pt-8 border-t border-slate-100">
          <p className="text-sm text-slate-400">
            We're working hard to bring you this content.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
