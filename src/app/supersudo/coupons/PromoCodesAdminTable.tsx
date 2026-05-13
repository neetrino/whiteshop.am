'use client';

import { Card } from '@shop/ui';
import type { PromoCodeAdminRow } from '@/lib/promo-codes/types';
import {
  ADMIN_TABLE,
  ADMIN_TABLE_CARD,
  ADMIN_TABLE_OUTER_SCROLL,
  ADMIN_TABLE_TBODY,
  ADMIN_TABLE_TD,
  ADMIN_TABLE_TH,
  ADMIN_TABLE_THEAD,
} from '../constants/admin-table-classes';

export type PromoCodesAdminTableProps = {
  rows: PromoCodeAdminRow[];
  emptyText: string;
  labels: Record<string, string>;
  onEdit: (row: PromoCodeAdminRow) => void;
  onCopy: (code: string) => void;
  onDelete: (row: PromoCodeAdminRow) => void;
};

function formatShortDate(iso: string | null): string {
  if (!iso) {
    return '—';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '—';
  }
  return d.toLocaleString();
}

export function PromoCodesAdminTable({
  rows,
  emptyText,
  labels,
  onEdit,
  onCopy,
  onDelete,
}: PromoCodesAdminTableProps) {
  if (rows.length === 0) {
    return (
      <Card className={ADMIN_TABLE_CARD}>
        <div className="p-8 text-center text-gray-500">{emptyText}</div>
      </Card>
    );
  }

  return (
    <Card className={ADMIN_TABLE_CARD}>
      <div className={ADMIN_TABLE_OUTER_SCROLL}>
        <table className={ADMIN_TABLE}>
          <thead className={ADMIN_TABLE_THEAD}>
            <tr>
              <th className={ADMIN_TABLE_TH}>{labels.tableCode}</th>
              <th className={ADMIN_TABLE_TH}>{labels.tableType}</th>
              <th className={ADMIN_TABLE_TH}>{labels.tableValue}</th>
              <th className={ADMIN_TABLE_TH}>{labels.tableMinSubtotal}</th>
              <th className={ADMIN_TABLE_TH}>{labels.tableCap}</th>
              <th className={ADMIN_TABLE_TH}>{labels.tableUsage}</th>
              <th className={ADMIN_TABLE_TH}>{labels.tableUsed}</th>
              <th className={ADMIN_TABLE_TH}>{labels.tableActive}</th>
              <th className={ADMIN_TABLE_TH}>{labels.tableValid}</th>
              <th className={ADMIN_TABLE_TH}>{labels.tableActions}</th>
            </tr>
          </thead>
          <tbody className={ADMIN_TABLE_TBODY}>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className={ADMIN_TABLE_TD}>
                  <span className="font-mono font-medium">{row.code}</span>
                </td>
                <td className={ADMIN_TABLE_TD}>
                  {row.discountType === 'percent' ? labels.typePercent : labels.typeFixed}
                </td>
                <td className={ADMIN_TABLE_TD}>
                  {row.discountType === 'percent' ? `${row.discountValue}%` : String(row.discountValue)}
                </td>
                <td className={ADMIN_TABLE_TD}>{row.minSubtotal ?? '—'}</td>
                <td className={ADMIN_TABLE_TD}>{row.maxDiscountAmount ?? '—'}</td>
                <td className={ADMIN_TABLE_TD}>{row.usageLimit ?? '—'}</td>
                <td className={ADMIN_TABLE_TD}>{row.usedCount}</td>
                <td className={ADMIN_TABLE_TD}>{row.active ? '✓' : '—'}</td>
                <td className={ADMIN_TABLE_TD}>{formatShortDate(row.validUntil)}</td>
                <td className={ADMIN_TABLE_TD}>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:underline"
                      onClick={() => onEdit(row)}
                    >
                      {labels.edit}
                    </button>
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:underline"
                      onClick={() => onCopy(row.code)}
                    >
                      {labels.copy}
                    </button>
                    <button
                      type="button"
                      className="text-sm text-red-600 hover:underline"
                      onClick={() => onDelete(row)}
                    >
                      {labels.delete}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
