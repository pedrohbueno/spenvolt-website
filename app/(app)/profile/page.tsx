'use client';

import { useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { clearSession, getSessionEmail, getSessionName, subscribeToSession } from '@/lib/session';
import ProfileCard from '@/components/profile/ProfileCard';

export default function ProfilePage() {
  const router = useRouter();
  const name = useSyncExternalStore(subscribeToSession, getSessionName, () => '');
  const email = useSyncExternalStore(subscribeToSession, getSessionEmail, () => '');

  function logout() {
    clearSession();
    router.replace('/login');
  }

  return <ProfileCard name={name} email={email} onLogout={logout} />;
}
