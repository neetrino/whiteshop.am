'use client';

import { useTranslation } from '../../../../lib/i18n-client';
import { Card, Button } from '@shop/ui';

interface BulkSelectionControlsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  bulkDeleting: boolean;
}

export function BulkSelectionControls({
  selectedCount,
  onBulkDelete,
  bulkDeleting,
}: BulkSelectionControlsProps) {
  const { t } = useTranslation();
  const hasSelection = selectedCount > 0;
  const deleteDisabled = !hasSelection || bulkDeleting;

  return (
    <Card className="mb-6 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-gray-700">
          {t('admin.orders.selectedOrders').replace('{count}', selectedCount.toString())}
        </div>
        <Button
          variant="outline"
          type="button"
          onClick={onBulkDelete}
          disabled={deleteDisabled}
        >
          {bulkDeleting ? t('admin.orders.deleting') : t('admin.orders.deleteSelected')}
        </Button>
      </div>
    </Card>
  );
}

