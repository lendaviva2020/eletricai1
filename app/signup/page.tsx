'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { WorkspaceProvider } from '@/components/shared/WorkspaceContext';
import { SettingsProvider } from '@/components/shared/SettingsContext';
import { IndustrialSignUpScreen } from '@/components/auth/IndustrialSignUpScreen';

export default function SignUpPage() {
  const router = useRouter();

  return (
    <SettingsProvider>
      <WorkspaceProvider>
        <IndustrialSignUpScreen onSwitchToLogin={() => router.push('/')} />
      </WorkspaceProvider>
    </SettingsProvider>
  );
}
