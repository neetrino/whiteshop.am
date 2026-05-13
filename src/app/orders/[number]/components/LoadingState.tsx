'use client';

import { ORDER_DETAIL_INNER_CLASS } from '../constants/order-detail-ui';

export function LoadingState() {
  return (
    <div className={ORDER_DETAIL_INNER_CLASS}>
      <div className="animate-pulse">
        <div className="mx-auto mb-8 h-20 w-20 rounded-full bg-gray-200" />
        <div className="mx-auto mb-4 h-8 max-w-sm rounded bg-gray-200" />
        <div className="mx-auto mb-10 h-4 max-w-md rounded bg-gray-200" />
        <div className="mb-8 h-48 rounded-2xl bg-gray-200" />
        <div className="mb-8 h-32 rounded-2xl bg-gray-200" />
        <div className="mb-10 flex gap-3">
          <div className="h-12 flex-1 rounded-xl bg-gray-200" />
          <div className="h-12 flex-1 rounded-xl bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
