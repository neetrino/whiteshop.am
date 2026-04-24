'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../../lib/auth/AuthContext';
import { AdminMenuDrawer } from '../../../components/AdminMenuDrawer';
import { BrandLogoLink } from '../../../components/BrandLogoLink';
import { getAdminMenuTABS } from '../admin-menu.config';
import { useTranslation } from '../../../lib/i18n-client';
import { AttributesPageContent } from './AttributesPageContent';
import {
  ADMIN_MAIN_COLUMN,
  ADMIN_MAIN_INNER,
  ADMIN_PAGE_SHELL,
  ADMIN_SIDEBAR_ASIDE,
  ADMIN_SIDEBAR_MOBILE_DRAWER_WRAP,
  ADMIN_SIDEBAR_NAV,
} from '../admin-sidebar-classes';
import { AdminSidebarBrand } from '../components/AdminSidebarBrand';

export default function AttributesPage() {
  const { t } = useTranslation();
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [currentPath, setCurrentPath] = useState(pathname || '/admin/attributes');

  useEffect(() => {
    if (pathname) {
      setCurrentPath(pathname);
    }
  }, [pathname]);

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn || !isAdmin) {
        router.push('/admin');
      }
    }
  }, [isLoggedIn, isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">{t('admin.common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return null; // Will redirect
  }

  const adminTabs = getAdminMenuTABS(t);

  return (
    <div className={ADMIN_PAGE_SHELL}>
      <div className={ADMIN_SIDEBAR_MOBILE_DRAWER_WRAP}>
        <div className="flex items-center justify-between gap-3">
          <BrandLogoLink className="min-w-0 shrink" />
          <AdminMenuDrawer tabs={adminTabs} currentPath={currentPath} />
        </div>
      </div>

      <aside className={ADMIN_SIDEBAR_ASIDE}>
        <AdminSidebarBrand />
        <nav className={ADMIN_SIDEBAR_NAV}>
          {adminTabs.map((tab) => {
            const isActive =
              currentPath === tab.path ||
              (tab.path === '/admin' && currentPath === '/admin') ||
              (tab.path !== '/admin' && currentPath.startsWith(tab.path));
            return (
              <button
                key={tab.id}
                onClick={() => {
                  router.push(tab.path);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${
                  tab.isSubCategory ? 'pl-12' : ''
                } ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                  {tab.icon}
                </span>
                <span className="text-left">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className={ADMIN_MAIN_COLUMN}>
        <div className={ADMIN_MAIN_INNER}>
          <AttributesPageContent />
        </div>
      </div>
    </div>
  );
}

