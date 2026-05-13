'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@shop/ui';
import { useAuth } from '../../../lib/auth/AuthContext';
import { apiClient, ApiError } from '../../../lib/api-client';
import { useTranslation } from '../../../lib/i18n-client';
import { logger } from '@/lib/utils/logger';
import { useAdminDialogs } from '../context/AdminDialogsContext';
import type { PromoCodeAdminRow } from '@/lib/promo-codes/types';
import {
  formatIsoForDatetimeLocal,
  parseDatetimeLocalToIso,
} from '@/lib/promo-codes/datetime-local';
import type { PromoFormFields } from './coupons-admin-types';
import { PromoCodesAdminFormCard } from './PromoCodesAdminFormCard';
import { PromoCodesAdminTable } from './PromoCodesAdminTable';

type PromoListResponse = { data: PromoCodeAdminRow[] };

function emptyForm(): PromoFormFields {
  return {
    code: '',
    description: '',
    discountType: 'percent',
    discountValue: '10',
    minSubtotal: '',
    maxDiscountAmount: '',
    usageLimit: '',
    active: true,
    validFrom: '',
    validUntil: '',
  };
}

function rowToForm(row: PromoCodeAdminRow): PromoFormFields {
  return {
    code: row.code,
    description: row.description ?? '',
    discountType: row.discountType,
    discountValue: String(row.discountValue),
    minSubtotal: row.minSubtotal != null ? String(row.minSubtotal) : '',
    maxDiscountAmount: row.maxDiscountAmount != null ? String(row.maxDiscountAmount) : '',
    usageLimit: row.usageLimit != null ? String(row.usageLimit) : '',
    active: row.active,
    validFrom: formatIsoForDatetimeLocal(row.validFrom),
    validUntil: formatIsoForDatetimeLocal(row.validUntil),
  };
}

function parseNumField(raw: string): number | null {
  const t = raw.trim();
  if (t === '') {
    return null;
  }
  const n = Number(t);
  return Number.isFinite(n) ? n : Number.NaN;
}

export function CouponsAdminClient() {
  const { t } = useTranslation();
  const { confirm: confirmDialog } = useAdminDialogs();
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<PromoCodeAdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PromoFormFields>(emptyForm);
  const [flash, setFlash] = useState<string | null>(null);

  const formCardLabels = useMemo(
    () => ({
      formCode: t('admin.coupons.formCode'),
      formCodeHint: t('admin.coupons.formCodeHint'),
      formDescription: t('admin.coupons.formDescription'),
      formDiscountType: t('admin.coupons.formDiscountType'),
      formDiscountValue: t('admin.coupons.formDiscountValue'),
      formMinSubtotal: t('admin.coupons.formMinSubtotal'),
      formMaxCap: t('admin.coupons.formMaxCap'),
      formUsageLimit: t('admin.coupons.formUsageLimit'),
      formActive: t('admin.coupons.formActive'),
      formValidFrom: t('admin.coupons.formValidFrom'),
      formValidUntil: t('admin.coupons.formValidUntil'),
      typePercent: t('admin.coupons.typePercent'),
      typeFixed: t('admin.coupons.typeFixed'),
      save: t('admin.coupons.save'),
      cancel: t('admin.coupons.cancel'),
    }),
    [t]
  );

  const tableLabels = useMemo(
    () => ({
      tableCode: t('admin.coupons.tableCode'),
      tableType: t('admin.coupons.tableType'),
      tableValue: t('admin.coupons.tableValue'),
      tableMinSubtotal: t('admin.coupons.tableMinSubtotal'),
      tableCap: t('admin.coupons.tableCap'),
      tableUsage: t('admin.coupons.tableUsage'),
      tableUsed: t('admin.coupons.tableUsed'),
      tableActive: t('admin.coupons.tableActive'),
      tableValid: t('admin.coupons.tableValid'),
      tableActions: t('admin.coupons.tableActions'),
      typePercent: t('admin.coupons.typePercent'),
      typeFixed: t('admin.coupons.typeFixed'),
      edit: t('admin.coupons.edit'),
      copy: t('admin.coupons.copy'),
      delete: t('admin.coupons.delete'),
    }),
    [t]
  );

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<PromoListResponse>('/api/v1/admin/coupons');
      setRows(res.data);
    } catch (e) {
      logger.error('[ADMIN COUPONS] load failed', { err: e });
      alert(t('admin.coupons.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isLoading && (!isLoggedIn || !isAdmin)) {
      router.push('/supersudo');
    }
  }, [isLoggedIn, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      void loadList();
    }
  }, [isLoggedIn, isAdmin, loadList]);

  useEffect(() => {
    if (!flash) {
      return;
    }
    const id = window.setTimeout(() => setFlash(null), 2000);
    return () => window.clearTimeout(id);
  }, [flash]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (row: PromoCodeAdminRow) => {
    setEditingId(row.id);
    setForm(rowToForm(row));
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const buildPayload = (): Record<string, unknown> | null => {
    const discountValue = Number(form.discountValue);
    if (!Number.isFinite(discountValue)) {
      alert(t('admin.coupons.saveError').replace('{message}', 'Invalid discount value'));
      return null;
    }
    const minSubtotal = parseNumField(form.minSubtotal);
    const maxDiscountAmount = parseNumField(form.maxDiscountAmount);
    const usageLimitRaw = parseNumField(form.usageLimit);
    if (form.minSubtotal.trim() !== '' && Number.isNaN(minSubtotal!)) {
      alert(t('admin.coupons.saveError').replace('{message}', 'Invalid minimum subtotal'));
      return null;
    }
    if (form.maxDiscountAmount.trim() !== '' && Number.isNaN(maxDiscountAmount!)) {
      alert(t('admin.coupons.saveError').replace('{message}', 'Invalid max discount'));
      return null;
    }
    if (form.usageLimit.trim() !== '' && (usageLimitRaw == null || Number.isNaN(usageLimitRaw))) {
      alert(t('admin.coupons.saveError').replace('{message}', 'Invalid usage limit'));
      return null;
    }
    const validFromIso = parseDatetimeLocalToIso(form.validFrom);
    const validUntilIso = parseDatetimeLocalToIso(form.validUntil);
    return {
      code: form.code,
      description: form.description.trim() || null,
      discountType: form.discountType,
      discountValue,
      minSubtotal: minSubtotal ?? null,
      maxDiscountAmount: maxDiscountAmount ?? null,
      usageLimit: usageLimitRaw == null ? null : Math.floor(usageLimitRaw),
      active: form.active,
      validFrom: validFromIso,
      validUntil: validUntilIso,
    };
  };

  const handleSave = async () => {
    const payload = buildPayload();
    if (!payload) {
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await apiClient.put(`/api/v1/admin/coupons/${editingId}`, payload);
      } else {
        await apiClient.post('/api/v1/admin/coupons', payload);
      }
      closeForm();
      await loadList();
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Error';
      logger.error('[ADMIN COUPONS] save failed', { err: e });
      alert(t('admin.coupons.saveError').replace('{message}', msg));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: PromoCodeAdminRow) => {
    const ok = await confirmDialog({
      title: t('admin.coupons.delete'),
      message: t('admin.coupons.deleteConfirm'),
      confirmText: t('admin.coupons.delete'),
      destructive: true,
    });
    if (!ok) {
      return;
    }
    try {
      await apiClient.delete(`/api/v1/admin/coupons/${row.id}`);
      await loadList();
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Error';
      logger.error('[ADMIN COUPONS] delete failed', { err: e });
      alert(t('admin.coupons.saveError').replace('{message}', msg));
    }
  };

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setFlash(t('admin.coupons.copied'));
    } catch {
      setFlash(t('admin.coupons.copyFailed'));
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900" />
          <p className="text-gray-600">{t('admin.common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t('admin.coupons.title')}</h1>
          <p className="text-sm text-gray-600">{t('admin.coupons.subtitle')}</p>
        </div>
        <Button variant="primary" type="button" onClick={openCreate}>
          {t('admin.coupons.add')}
        </Button>
      </div>

      {flash ? (
        <p className="text-sm text-green-700" role="status">
          {flash}
        </p>
      ) : null}

      {showForm ? (
        <PromoCodesAdminFormCard
          editingId={editingId}
          form={form}
          setForm={setForm}
          saving={saving}
          onSave={() => void handleSave()}
          onCancel={closeForm}
          titleCreate={t('admin.coupons.formCreateTitle')}
          titleEdit={t('admin.coupons.formEditTitle')}
          labels={formCardLabels}
        />
      ) : null}

      <PromoCodesAdminTable
        rows={rows}
        emptyText={t('admin.coupons.empty')}
        labels={tableLabels}
        onEdit={openEdit}
        onCopy={(code) => void handleCopy(code)}
        onDelete={(row) => void handleDelete(row)}
      />
    </div>
  );
}
