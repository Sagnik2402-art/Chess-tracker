import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-full w-full p-8">
    <div className="relative">
      <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-lichess-gold animate-spin"></div>
      <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-4 border-b-4 border-lichess-gold animate-ping opacity-25"></div>
    </div>
  </div>
);