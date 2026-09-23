import { createClient, isSupabaseConfigured } from './client';
import { Database } from '@/types/supabase';
import { IndustrialProject, IndustrialAlert } from '@/types/dashboard';
import { SharedTag } from '@/types/electrical';

export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  latencyMs?: number;
}> {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      message: 'Supabase URL/Anon Key não configurados no ambiente (.env.local).',
    };
  }

  const start = performance.now();
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('tenants').select('id, name').limit(1);
    const latencyMs = Math.round(performance.now() - start);

    if (error) {
      return {
        connected: false,
        message: `Erro na consulta: ${error.message}`,
        latencyMs,
      };
    }

    return {
      connected: true,
      message: `Conexão ativa com PostgreSQL Supabase (${data?.length || 0} tenant verificado).`,
      latencyMs,
    };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      connected: false,
      message: err instanceof Error ? err.message : 'Falha desconhecida na conexão com Supabase.',
      latencyMs,
    };
  }
}

export async function getSupabaseProjects(tenantId: string): Promise<IndustrialProject[]> {
  if (!isSupabaseConfigured) return [];

  type ProjectRow = Database['public']['Tables']['projects']['Row'];

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('updated_at', { ascending: false });

    if (error || !data) return [];

    const projectRows = data as unknown as ProjectRow[];

    return projectRows.map((p: ProjectRow) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      type: p.type as IndustrialProject['type'],
      typeLabel: p.type_label,
      status: p.status as IndustrialProject['status'],
      progressPercent: p.progress_percent,
      lastUpdated: new Date(p.updated_at).toLocaleDateString('pt-BR'),
      lastUpdatedTimestamp: new Date(p.updated_at).getTime(),
      updatedBy: {
        name: 'Eng. Responsável',
        role: 'engineer',
      },
      nominalVoltage: p.nominal_voltage,
      normativeStandard: p.normative_standard as IndustrialProject['normativeStandard'],
      targetTab: p.target_tab as IndustrialProject['targetTab'],
      description: p.description || '',
    }));
  } catch {
    return [];
  }
}

export async function updateSupabaseTagValue(tagId: string, value: boolean | number | string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('shared_tags')
      .update({
        current_value: value,
        last_updated: new Date().toISOString(),
      })
      .eq('id', tagId);

    return !error;
  } catch {
    return false;
  }
}
