'use client';

import { usePathname } from 'next/navigation';
import { Breadcrumb } from './Breadcrumb';

export function ConditionalBreadcrumb() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  return <Breadcrumb />;
}
