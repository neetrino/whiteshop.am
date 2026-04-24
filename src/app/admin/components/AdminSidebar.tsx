'use client';

import { usePathname, useRouter } from 'next/navigation';
import { AdminMenuDrawer } from '../../../components/AdminMenuDrawer';
import { BrandLogoLink } from '../../../components/BrandLogoLink';
import { useTranslation } from '../../../lib/i18n-client';
import { getAdminMenuTABS } from '../admin-menu.config';
import {
  ADMIN_SIDEBAR_ASIDE,
  ADMIN_SIDEBAR_MOBILE_DRAWER_WRAP,
  ADMIN_SIDEBAR_NAV,
} from '../admin-sidebar-classes';
import { useAdminSidebarCollapse } from '../context/AdminSidebarCollapseContext';
import { AdminSidebarBrand } from './AdminSidebarBrand';

export function AdminSidebar() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname() ?? '/admin';
  const adminTabs = getAdminMenuTABS(t);
  const { collapsed } = useAdminSidebarCollapse();

  const asideWidthClass = collapsed ? 'lg:w-16' : 'lg:w-64';

  return (
    <>
      <div className={ADMIN_SIDEBAR_MOBILE_DRAWER_WRAP}>
        <div className="flex items-center justify-between gap-3">
          <BrandLogoLink className="min-w-0 shrink" />
          <AdminMenuDrawer tabs={adminTabs} currentPath={pathname} />
        </div>
      </div>
      <aside className={`${ADMIN_SIDEBAR_ASIDE} ${asideWidthClass}`}>
        <AdminSidebarBrand />
        <nav
          className={`${ADMIN_SIDEBAR_NAV} ${collapsed ? 'px-1' : 'px-2'}`}
        >
          {adminTabs.map((tab) => {
            const isActive =
              pathname === tab.path ||
              (tab.path === '/admin' && pathname === '/admin') ||
              (tab.path !== '/admin' && pathname.startsWith(tab.path));
            return (
              <button
                key={tab.id}
                type="button"
                title={tab.label}
                onClick={() => {
                  router.push(tab.path);
                }}
                className={`flex w-full items-center rounded-md text-sm font-medium transition-all ${
                  collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-3'
                } ${tab.isSubCategory && !collapsed ? 'pl-12' : ''} ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                  {tab.icon}
                </span>
                {!collapsed ? <span className="min-w-0 text-left">{tab.label}</span> : null}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
