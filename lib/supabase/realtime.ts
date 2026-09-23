'use client';

import { useEffect } from 'react';
import { createClient, isSupabaseConfigured } from './client';
import { SharedTag, ElectricalComponent } from '@/types/electrical';
import { IndustrialAlert } from '@/types/dashboard';

interface RealtimeSubscriptionProps {
  tenantId: string;
  onTagUpdate?: (tag: SharedTag) => void;
  onComponentUpdate?: (comp: ElectricalComponent) => void;
  onAlertInsert?: (alert: IndustrialAlert) => void;
}

export function useSupabaseRealtime({
  tenantId,
  onTagUpdate,
  onComponentUpdate,
  onAlertInsert,
}: RealtimeSubscriptionProps) {
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const supabase = createClient();
    const channelName = `realtime-tenant-${tenantId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shared_tags',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          if (onTagUpdate && payload.new) {
            onTagUpdate(payload.new as unknown as SharedTag);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'components',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          if (onComponentUpdate && payload.new) {
            onComponentUpdate(payload.new as unknown as ElectricalComponent);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          if (onAlertInsert && payload.new) {
            onAlertInsert(payload.new as unknown as IndustrialAlert);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, onTagUpdate, onComponentUpdate, onAlertInsert]);
}
