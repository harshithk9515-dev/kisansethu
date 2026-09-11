import React from 'react';

export function CardSkeleton() {
  return (
    <div className="animate-pulse bg-white border border-gray-200 rounded-xl p-5">
      <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
      <div className="h-24 bg-gray-50 rounded mb-3" />
      <div className="h-3 bg-gray-100 rounded w-full mb-2" />
      <div className="h-3 bg-gray-100 rounded w-5/6" />
    </div>
  );
}

export function GridSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}

export default CardSkeleton;
