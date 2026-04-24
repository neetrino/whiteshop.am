'use client';

import { useRouter } from 'next/navigation';
import { AdminMenuDrawer } from '../../../../components/AdminMenuDrawer';
import { BrandLogoLink } from '../../../../components/BrandLogoLink';
import { getAdminMenuTABS } from '../../admin-menu.config';
import {
  ADMIN_SIDEBAR_ASIDE,
  ADMIN_SIDEBAR_MOBILE_DRAWER_WRAP,
  ADMIN_SIDEBAR_NAV,
} from '../../admin-sidebar-classes';
import { AdminSidebarBrand } from '../../components/AdminSidebarBrand';

interface AdminSidebarProps {
  currentPath: string;
  router: ReturnType<typeof useRouter>;
  t: ReturnType<typeof import('../../../../lib/i18n-client').useTranslation>['t'];
}

export function AdminSidebar({ currentPath, router, t }: AdminSidebarProps) {
  const adminTabs = getAdminMenuTABS(t);

  return (
    <>
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
            const isActive = currentPath === tab.path || 
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
    </>
  );
}

