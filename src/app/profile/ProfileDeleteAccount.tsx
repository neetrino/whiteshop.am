import type { FormEvent } from 'react';
import { Button, Input, Card } from '@shop/ui';
import type { UserProfile } from './types';

interface ProfileDeleteAccountProps {
  profile: UserProfile | null;
  password: string;
  setPassword: (value: string) => void;
  confirmation: string;
  setConfirmation: (value: string) => void;
  acknowledged: boolean;
  setAcknowledged: (value: boolean) => void;
  deleting: boolean;
  onSubmit: (e: FormEvent) => void;
  t: (key: string) => string;
}

export function ProfileDeleteAccount({
  profile,
  password,
  setPassword,
  confirmation,
  setConfirmation,
  acknowledged,
  setAcknowledged,
  deleting,
  onSubmit,
  t,
}: ProfileDeleteAccountProps) {
  if (!profile) {
    return (
      <Card className="p-6">
        <p className="text-sm text-gray-600">{t('profile.common.loadingProfile')}</p>
      </Card>
    );
  }

  const hasPassword = profile.hasPassword ?? true;

  return (
    <Card className="p-6 border border-red-200 bg-red-50/30">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('profile.deleteAccount.title')}</h2>
      <p className="text-sm text-gray-700 mb-6">{t('profile.deleteAccount.description')}</p>

      <ul className="text-sm text-gray-600 list-disc pl-5 mb-6 space-y-1">
        <li>{t('profile.deleteAccount.pointOrders')}</li>
        <li>{t('profile.deleteAccount.pointLogin')}</li>
        <li>{t('profile.deleteAccount.pointData')}</li>
      </ul>

      <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
        {hasPassword ? (
          <Input
            label={t('profile.deleteAccount.currentPassword')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('profile.deleteAccount.currentPasswordPlaceholder')}
            autoComplete="current-password"
            required
          />
        ) : (
          <Input
            label={t('profile.deleteAccount.confirmationLabel')}
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder={t('profile.deleteAccount.confirmationPlaceholder')}
            autoComplete="off"
            required
          />
        )}

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
          />
          <span className="text-sm text-gray-800">{t('profile.deleteAccount.acknowledge')}</span>
        </label>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            className="!bg-red-700 hover:!bg-red-800 focus:!ring-red-600 text-white"
            disabled={deleting || !acknowledged}
          >
            {deleting ? t('profile.deleteAccount.deleting') : t('profile.deleteAccount.submit')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
