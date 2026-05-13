'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Card, Button } from '@shop/ui';
import type { PromoFormFields } from './coupons-admin-types';

export type PromoCodesAdminFormCardProps = {
  editingId: string | null;
  form: PromoFormFields;
  setForm: Dispatch<SetStateAction<PromoFormFields>>;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
  titleCreate: string;
  titleEdit: string;
  labels: Record<string, string>;
};

export function PromoCodesAdminFormCard({
  editingId,
  form,
  setForm,
  saving,
  onSave,
  onCancel,
  titleCreate,
  titleEdit,
  labels,
}: PromoCodesAdminFormCardProps) {
  const title = editingId ? titleEdit : titleCreate;

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="pc-code">
            {labels.formCode}
          </label>
          <input
            id="pc-code"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            autoComplete="off"
          />
          <p className="mt-1 text-xs text-gray-500">{labels.formCodeHint}</p>
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="pc-desc">
            {labels.formDescription}
          </label>
          <input
            id="pc-desc"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="pc-type">
            {labels.formDiscountType}
          </label>
          <select
            id="pc-type"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.discountType}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                discountType: e.target.value === 'fixed' ? 'fixed' : 'percent',
              }))
            }
          >
            <option value="percent">{labels.typePercent}</option>
            <option value="fixed">{labels.typeFixed}</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="pc-val">
            {labels.formDiscountValue}
          </label>
          <input
            id="pc-val"
            type="number"
            min="0"
            step="0.01"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.discountValue}
            onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="pc-min">
            {labels.formMinSubtotal}
          </label>
          <input
            id="pc-min"
            type="number"
            min="0"
            step="1"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.minSubtotal}
            onChange={(e) => setForm((f) => ({ ...f, minSubtotal: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="pc-cap">
            {labels.formMaxCap}
          </label>
          <input
            id="pc-cap"
            type="number"
            min="0"
            step="1"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.maxDiscountAmount}
            onChange={(e) => setForm((f) => ({ ...f, maxDiscountAmount: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="pc-limit">
            {labels.formUsageLimit}
          </label>
          <input
            id="pc-limit"
            type="number"
            min="1"
            step="1"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.usageLimit}
            onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            id="pc-active"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={form.active}
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
          />
          <label htmlFor="pc-active" className="text-sm font-medium text-gray-700">
            {labels.formActive}
          </label>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="pc-from">
            {labels.formValidFrom}
          </label>
          <input
            id="pc-from"
            type="datetime-local"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.validFrom}
            onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="pc-until">
            {labels.formValidUntil}
          </label>
          <input
            id="pc-until"
            type="datetime-local"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.validUntil}
            onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))}
          />
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="primary" type="button" onClick={onSave} disabled={saving}>
          {labels.save}
        </Button>
        <Button variant="ghost" type="button" onClick={onCancel} disabled={saving}>
          {labels.cancel}
        </Button>
      </div>
    </Card>
  );
}
