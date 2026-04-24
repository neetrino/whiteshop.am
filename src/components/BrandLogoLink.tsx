import Link from 'next/link';
import type { ComponentProps } from 'react';

export type BrandLogoLinkProps = Omit<ComponentProps<typeof Link>, 'href' | 'children'>;

export function BrandLogoLink({ className = '', ...rest }: BrandLogoLinkProps) {
  return (
    <Link
      href="/"
      className={`group flex flex-shrink-0 items-center ${className}`}
      {...rest}
    >
      <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-xl font-bold text-transparent transition-all duration-300 group-hover:from-gray-800 group-hover:to-gray-600 sm:text-2xl">
        White-Shop
      </span>
    </Link>
  );
}
