import { createClient, isSupabaseConfigured } from './client';
import { Database } from '@/types/supabase';
import { IndustrialProject, IndustrialAlert, ActivityEvent } from '@/types/dashboard';
import {
  ElectricalComponent,
  ElectricalConnection,
  SharedTag,
  LadderRung,
  UserProfile,
  Tenant,
} from '@/types/electrical';
import {
  ProjectRevision,
  ElectricalCircuit,
  UniversalSymbol,
  EngineeringAuditLog,
  TechnicalDocument,
  ExtractedTechnicalEntity,
} from '@/lib/engineering/core/types';

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

// ==========================================
// USER & TENANT REAL DATA SERVICE
// ==========================================

export async function getSupabaseProfileAndTenant(userId: string): Promise<{
  profile: UserProfile | null;
  tenant: Tenant | null;
}> {
  if (!isSupabaseConfigured) return { profile: null, tenant: null };

  try {
    const supabase = createClient();

    // 1. Fetch user profile
    const { data: profileRow, error: pError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (pError || !profileRow) {
      console.warn('Perfil não encontrado no Supabase para userId:', userId);
      return { profile: null, tenant: null };
    }

    const profile: UserProfile = {
      id: profileRow.id,
      name: profileRow.name,
      email: profileRow.email,
      role: profileRow.role as UserProfile['role'],
      creaNumber: profileRow.crea_number || undefined,
      tenantId: profileRow.tenant_id,
    };

    // 2. Fetch tenant
    const { data: tenantRow, error: tError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', profileRow.tenant_id)
      .maybeSingle();

    let tenant: Tenant | null = null;
    if (tenantRow) {
      tenant = {
        id: tenantRow.id,
        name: tenantRow.name,
        subname: tenantRow.location || 'Planta Industrial',
        cnpj: tenantRow.cnpj,
        location: tenantRow.location,
        plan: (tenantRow.plan || 'Industrial Pro') as Tenant['plan'],
        currency: 'BRL',
        voltage: '13.8 kV / 380V - 60Hz',
        tagsCount: 0,
        membersCount: 1,
        category: 'client',
      };
    }

    return { profile, tenant };
  } catch (err) {
    console.error('Erro ao buscar perfil e tenant no Supabase:', err);
    return { profile: null, tenant: null };
  }
}

// ==========================================
// PROJECTS REAL PERSISTENCE SERVICE
// ==========================================

export async function getSupabaseProjects(tenantId: string): Promise<IndustrialProject[]> {
  if (!isSupabaseConfigured || !tenantId) return [];

  type ProjectRow = Database['public']['Tables']['projects']['Row'];

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('updated_at', { ascending: false });

    if (error || !data) {
      console.warn('Nenhum projeto encontrado ou erro no Supabase:', error?.message);
      return [];
    }

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
  } catch (err) {
    console.error('Erro ao ler projetos no Supabase:', err);
    return [];
  }
}

export async function createSupabaseProject(
  tenantId: string,
  project: IndustrialProject,
  userId?: string
): Promise<{ success: boolean; project?: IndustrialProject; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase não configurado' };
  }

  try {
    const supabase = createClient();

    const insertPayload = {
      id: project.id,
      tenant_id: tenantId,
      code: project.code,
      name: project.name,
      type: project.type,
      type_label: project.typeLabel,
      status: project.status,
      progress_percent: project.progressPercent,
      nominal_voltage: project.nominalVoltage,
      normative_standard: project.normativeStandard,
      target_tab: project.targetTab,
      description: project.description || '',
      created_by_id: userId || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('projects').insert(insertPayload);

    if (error) {
      console.error('Erro ao inserir projeto no Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true, project };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha ao salvar projeto';
    return { success: false, error: msg };
  }
}

export async function updateSupabaseProject(
  projectId: string,
  updates: Partial<IndustrialProject>
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase não configurado' };

  try {
    const supabase = createClient();

    const updatePayload: Database['public']['Tables']['projects']['Update'] = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updatePayload.name = updates.name;
    if (updates.code !== undefined) updatePayload.code = updates.code;
    if (updates.status !== undefined) updatePayload.status = updates.status;
    if (updates.progressPercent !== undefined) updatePayload.progress_percent = updates.progressPercent;
    if (updates.nominalVoltage !== undefined) updatePayload.nominal_voltage = updates.nominalVoltage;
    if (updates.normativeStandard !== undefined) updatePayload.normative_standard = updates.normativeStandard;
    if (updates.targetTab !== undefined) updatePayload.target_tab = updates.targetTab;
    if (updates.description !== undefined) updatePayload.description = updates.description;

    const { error } = await supabase
      .from('projects')
      .update(updatePayload)
      .eq('id', projectId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha ao atualizar projeto';
    return { success: false, error: msg };
  }
}

export async function deleteSupabaseProject(projectId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase não configurado' };

  try {
    const supabase = createClient();
    const { error } = await supabase.from('projects').delete().eq('id', projectId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha ao excluir projeto';
    return { success: false, error: msg };
  }
}

// ==========================================
// ELECTRICAL COMPONENTS REAL PERSISTENCE
// ==========================================

export async function getProjectComponents(projectId: string): Promise<ElectricalComponent[]> {
  if (!isSupabaseConfigured || !projectId) return [];

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('project_id', projectId);

    if (error || !data) return [];

    return data.map(row => {
      const meta = (row.metadata || {}) as Record<string, unknown>;
      const comp: ElectricalComponent = {
        id: row.id,
        tag: row.tag,
        name: row.name,
        category: (meta.category as ElectricalComponent['category']) || 'MOTOR_BREAKER',
        x: Number(row.position_x) || 100,
        y: Number(row.position_y) || 100,
        width: Number(meta.width) || 120,
        height: Number(meta.height) || 60,
        voltage: Number(row.voltage?.replace(/[^0-9.]/g, '')) || 380,
        nominalCurrent: Number(row.rated_current) || 32,
        operationalCurrent: Number(row.current) || 24,
        power: Number(row.power_kw) || undefined,
        breakingCapacity: Number(meta.breakingCapacity) || 25,
        cableCrossSection: Number(row.cable_section_mm2) || 4,
        voltageDropPercent: Number(meta.voltageDropPercent) || 1.2,
        isEnergized: Boolean(row.is_energized),
        statusText: row.status,
        manufacturer: (meta.manufacturer as string) || 'WEG',
        partNumber: (meta.partNumber as string) || 'MPW40',
        unitCostBrl: Number(meta.unitCostBrl) || 350,
        ports: (meta.ports as ElectricalComponent['ports']) || [
          { id: `p_in_${row.id}`, type: 'in', x: Number(row.position_x) + 60, y: Number(row.position_y) },
          { id: `p_out_${row.id}`, type: 'out', x: Number(row.position_x) + 60, y: Number(row.position_y) + 60 },
        ],
        notes: (meta.notes as string) || undefined,
        sheetPage: (meta.sheetPage as number) || undefined,
        pageNumber: (meta.pageNumber as number) || undefined,
        zone: (meta.zone as string) || undefined,
      };
      return comp;
    });
  } catch (err) {
    console.error('Erro ao ler componentes no Supabase:', err);
    return [];
  }
}

export async function saveProjectComponents(
  projectId: string,
  tenantId: string,
  components: ElectricalComponent[]
): Promise<boolean> {
  if (!isSupabaseConfigured || !projectId) return false;

  try {
    const supabase = createClient();

    // 1. If components list is empty, clear in DB
    if (components.length === 0) {
      await supabase.from('components').delete().eq('project_id', projectId);
      return true;
    }

    // 2. Map domain components to DB rows
    const rows = components.map(c => ({
      id: c.id,
      tenant_id: tenantId,
      project_id: projectId,
      tag: c.tag,
      name: c.name,
      type: c.category.toLowerCase(),
      voltage: `${c.voltage}V`,
      rated_current: c.nominalCurrent,
      current: c.operationalCurrent,
      power_kw: c.power || 0,
      cable_section_mm2: c.cableCrossSection || 2.5,
      status: c.statusText || 'OPERATIONAL',
      is_energized: c.isEnergized ?? true,
      position_x: c.x,
      position_y: c.y,
      metadata: {
        category: c.category,
        width: c.width,
        height: c.height,
        ports: c.ports,
        manufacturer: c.manufacturer,
        partNumber: c.partNumber,
        unitCostBrl: c.unitCostBrl,
        notes: c.notes,
        sheetPage: c.sheetPage,
        pageNumber: c.pageNumber,
        zone: c.zone,
        voltageDropPercent: c.voltageDropPercent,
        breakingCapacity: c.breakingCapacity,
      } as unknown as import('@/types/supabase').Json,
      updated_at: new Date().toISOString(),
    }));

    // 3. Upsert into public.components
    const { error } = await supabase.from('components').upsert(rows);
    if (error) {
      console.error('Erro ao salvar componentes no Supabase:', error.message);
      return false;
    }

    // 4. Remove deleted components
    const currentIds = components.map(c => c.id);
    const { data: existing } = await supabase
      .from('components')
      .select('id')
      .eq('project_id', projectId);

    if (existing) {
      const toDelete = existing.filter(e => !currentIds.includes(e.id)).map(e => e.id);
      if (toDelete.length > 0) {
        await supabase.from('components').delete().in('id', toDelete);
      }
    }

    return true;
  } catch (err) {
    console.error('Falha ao persistir componentes no Supabase:', err);
    return false;
  }
}

// ==========================================
// ELECTRICAL CONNECTIONS REAL PERSISTENCE
// ==========================================

export async function getProjectConnections(projectId: string): Promise<ElectricalConnection[]> {
  if (!isSupabaseConfigured || !projectId) return [];

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .eq('project_id', projectId);

    if (error || !data) return [];

    return data.map(row => ({
      id: row.id,
      fromComponentId: row.from_id,
      fromPortId: row.from_port,
      toComponentId: row.to_id,
      toPortId: row.to_port,
      isEnergized: Boolean(row.is_energized),
      voltage: 380,
      current: 24,
      wireGaugeMm2: 4,
      wireColor: '#F59E0B',
      voltageDropPercent: Number(row.voltage_drop_percent) || 0.8,
    }));
  } catch (err) {
    console.error('Erro ao ler conexões no Supabase:', err);
    return [];
  }
}

export async function saveProjectConnections(
  projectId: string,
  tenantId: string,
  connections: ElectricalConnection[]
): Promise<boolean> {
  if (!isSupabaseConfigured || !projectId) return false;

  try {
    const supabase = createClient();

    if (connections.length === 0) {
      await supabase.from('connections').delete().eq('project_id', projectId);
      return true;
    }

    const rows = connections.map(conn => ({
      id: conn.id,
      tenant_id: tenantId,
      project_id: projectId,
      from_id: conn.fromComponentId,
      to_id: conn.toComponentId,
      from_port: conn.fromPortId,
      to_port: conn.toPortId,
      is_energized: conn.isEnergized,
      voltage_drop_percent: conn.voltageDropPercent || 0.8,
    }));

    const { error } = await supabase.from('connections').upsert(rows);
    if (error) {
      console.error('Erro ao salvar conexões no Supabase:', error.message);
      return false;
    }

    const currentIds = connections.map(c => c.id);
    const { data: existing } = await supabase
      .from('connections')
      .select('id')
      .eq('project_id', projectId);

    if (existing) {
      const toDelete = existing.filter(e => !currentIds.includes(e.id)).map(e => e.id);
      if (toDelete.length > 0) {
        await supabase.from('connections').delete().in('id', toDelete);
      }
    }

    return true;
  } catch (err) {
    console.error('Falha ao persistir conexões no Supabase:', err);
    return false;
  }
}

// ==========================================
// SHARED TAGS REAL PERSISTENCE
// ==========================================

export async function getProjectSharedTags(projectId: string): Promise<SharedTag[]> {
  if (!isSupabaseConfigured || !projectId) return [];

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('shared_tags')
      .select('*')
      .eq('project_id', projectId);

    if (error || !data) return [];

    return data.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      address: row.address,
      dataType: (row.data_type || 'BOOL') as SharedTag['dataType'],
      direction: (row.direction || 'OUTPUT') as SharedTag['direction'],
      currentValue: row.current_value as boolean | number | string,
      unit: row.unit,
      isAlarmActive: row.is_alarm_active,
      lastUpdated: row.last_updated,
    }));
  } catch (err) {
    console.error('Erro ao ler tags no Supabase:', err);
    return [];
  }
}

export async function saveProjectSharedTags(
  projectId: string,
  tenantId: string,
  tags: SharedTag[]
): Promise<boolean> {
  if (!isSupabaseConfigured || !projectId) return false;

  try {
    const supabase = createClient();

    if (tags.length === 0) {
      await supabase.from('shared_tags').delete().eq('project_id', projectId);
      return true;
    }

    const rows = tags.map(t => ({
      id: t.id,
      tenant_id: tenantId,
      project_id: projectId,
      name: t.name,
      description: t.description || '',
      address: t.address || '%M0.0',
      data_type: t.dataType,
      direction: t.direction,
      current_value: t.currentValue ?? false,
      unit: t.unit || 'State',
      is_alarm_active: t.isAlarmActive ?? false,
      last_updated: new Date().toISOString(),
    }));

    const { error } = await supabase.from('shared_tags').upsert(rows);
    if (error) {
      console.error('Erro ao salvar tags no Supabase:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Falha ao persistir tags no Supabase:', err);
    return false;
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

// ==========================================
// LADDER RUNGS REAL PERSISTENCE
// ==========================================

export async function getProjectLadderRungs(projectId: string): Promise<LadderRung[]> {
  if (!isSupabaseConfigured || !projectId) return [];

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('ladder_rungs')
      .select('*')
      .eq('project_id', projectId)
      .order('rung_index', { ascending: true });

    if (error || !data) return [];

    return data.map(row => ({
      id: row.id,
      number: row.rung_index,
      title: row.comment || `Rung ${row.rung_index}`,
      comment: row.comment || '',
      elements: (row.elements || []) as unknown as LadderRung['elements'],
      isPowerFlowActive: Boolean(row.is_power_flow_active),
    }));
  } catch (err) {
    console.error('Erro ao ler rungs no Supabase:', err);
    return [];
  }
}

export async function saveProjectLadderRungs(
  projectId: string,
  tenantId: string,
  rungs: LadderRung[]
): Promise<boolean> {
  if (!isSupabaseConfigured || !projectId) return false;

  try {
    const supabase = createClient();

    if (rungs.length === 0) {
      await supabase.from('ladder_rungs').delete().eq('project_id', projectId);
      return true;
    }

    const rows = rungs.map((r, idx) => ({
      id: r.id,
      tenant_id: tenantId,
      project_id: projectId,
      rung_index: idx,
      comment: r.comment || r.title || '',
      is_power_flow_active: Boolean(r.isPowerFlowActive),
      elements: r.elements as unknown as import('@/types/supabase').Json,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('ladder_rungs').upsert(rows);
    if (error) {
      console.error('Erro ao salvar rungs no Supabase:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Falha ao persistir rungs no Supabase:', err);
    return false;
  }
}

// ==========================================
// FULL REAL SNAPSHOT PERSISTENCE
// ==========================================

export async function saveFullProjectSnapshot(
  projectId: string,
  tenantId: string,
  data: {
    components: ElectricalComponent[];
    connections: ElectricalConnection[];
    sharedTags: SharedTag[];
    ladderRungs: LadderRung[];
  }
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !projectId) {
    return { success: false, error: 'Supabase não conectado' };
  }

  try {
    const [cOk, cnOk, tOk, rOk] = await Promise.all([
      saveProjectComponents(projectId, tenantId, data.components),
      saveProjectConnections(projectId, tenantId, data.connections),
      saveProjectSharedTags(projectId, tenantId, data.sharedTags),
      saveProjectLadderRungs(projectId, tenantId, data.ladderRungs),
    ]);

    // Update project updated_at
    const supabase = createClient();
    await supabase
      .from('projects')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', projectId);

    if (!cOk || !cnOk || !tOk || !rOk) {
      return { success: false, error: 'Aviso: Alguns elementos não puderam ser gravados' };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha ao salvar snapshot no PostgreSQL';
    return { success: false, error: msg };
  }
}

// ==========================================
// DASHBOARD REAL ALERTS & ACTIVITIES
// ==========================================

export async function getDashboardAlerts(tenantId: string): Promise<IndustrialAlert[]> {
  if (!isSupabaseConfigured || !tenantId) return [];

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_resolved', false)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      severity: row.severity as IndustrialAlert['severity'],
      category: row.category as IndustrialAlert['category'],
      sourceTag: row.source_tag || undefined,
      componentId: row.component_id || undefined,
      timestamp: new Date(row.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      targetTab: row.target_tab as IndustrialAlert['targetTab'],
      suggestedAction: row.suggested_action || '',
      isResolved: row.is_resolved,
    }));
  } catch {
    return [];
  }
}

export async function getDashboardActivities(tenantId: string): Promise<ActivityEvent[]> {
  if (!isSupabaseConfigured || !tenantId) return [];

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('activity_events')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error || !data) return [];

    return data.map(row => ({
      id: row.id,
      type: row.type as ActivityEvent['type'],
      title: row.title,
      description: row.description || '',
      timestamp: new Date(row.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      user: {
        name: row.user_name || 'Engenheiro',
        role: 'engineer',
      },
      badgeColor: row.badge_color || 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
      targetTab: (row.target_tab as ActivityEvent['targetTab']) || 'unifilar',
    }));
  } catch {
    return [];
  }
}

export async function recordActivityEvent(
  tenantId: string,
  activity: Omit<ActivityEvent, 'id' | 'timestamp'> & { projectId?: string }
): Promise<void> {
  if (!isSupabaseConfigured || !tenantId) return;

  try {
    const supabase = createClient();
    await supabase.from('activity_events').insert({
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tenant_id: tenantId,
      project_id: activity.projectId || null,
      user_name: activity.user.name,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      target_tab: activity.targetTab,
      badge_color: activity.badgeColor,
    });
  } catch (err) {
    console.warn('Erro ao registrar activity no Supabase:', err);
  }
}

// ==========================================
// PROJECT REVISIONS REAL PERSISTENCE
// ==========================================

export async function getProjectRevisions(projectId: string): Promise<ProjectRevision[]> {
  if (!isSupabaseConfigured || !projectId) return [];

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('project_revisions')
      .select('*')
      .eq('project_id', projectId)
      .order('revision_number', { ascending: false });

    if (error || !data) return [];

    return data.map(r => ({
      id: r.id,
      projectId: r.project_id,
      tenantId: r.tenant_id,
      revisionNumber: r.revision_number,
      revisionCode: r.revision_code,
      title: r.title,
      description: r.description || undefined,
      snapshotData: (r.snapshot_data || {}) as unknown as ProjectRevision['snapshotData'],
      componentsCount: r.components_count,
      connectionsCount: r.connections_count,
      createdById: r.created_by_id || undefined,
      authorName: r.author_name || 'Eng. Responsável',
      creaArt: r.crea_art || undefined,
      createdAt: r.created_at,
    }));
  } catch (err) {
    console.error('Erro ao ler revisões do projeto:', err);
    return [];
  }
}

export async function createProjectRevision(
  revision: Omit<ProjectRevision, 'id' | 'createdAt'>
): Promise<{ success: boolean; revision?: ProjectRevision; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase não configurado' };

  try {
    const supabase = createClient();
    const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    const insertPayload = {
      id,
      tenant_id: revision.tenantId,
      project_id: revision.projectId,
      revision_number: revision.revisionNumber,
      revision_code: revision.revisionCode,
      title: revision.title,
      description: revision.description || null,
      snapshot_data: revision.snapshotData as unknown as import('@/types/supabase').Json,
      components_count: revision.componentsCount,
      connections_count: revision.connectionsCount,
      created_by_id: revision.createdById || null,
      author_name: revision.authorName,
      crea_art: revision.creaArt || null,
      created_at: nowIso,
    };

    const { error } = await supabase.from('project_revisions').insert(insertPayload);
    if (error) {
      return { success: false, error: error.message };
    }

    const createdRevision: ProjectRevision = {
      ...revision,
      id,
      createdAt: nowIso,
    };

    return { success: true, revision: createdRevision };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha ao gravar revisão';
    return { success: false, error: msg };
  }
}

// ==========================================
// CIRCUITS REAL PERSISTENCE
// ==========================================

export async function getProjectCircuits(projectId: string): Promise<ElectricalCircuit[]> {
  if (!isSupabaseConfigured || !projectId) return [];

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('circuits')
      .select('*')
      .eq('project_id', projectId)
      .order('circuit_number', { ascending: true });

    if (error || !data) return [];

    return data.map(c => ({
      id: c.id,
      projectId: c.project_id,
      tenantId: c.tenant_id,
      circuitNumber: c.circuit_number,
      name: c.name,
      panelTag: c.panel_tag,
      voltageV: Number(c.voltage_v) || 380,
      phases: (c.phases as ElectricalCircuit['phases']) || '3F+N+PE',
      powerKw: Number(c.power_kw) || 0,
      powerFactor: Number(c.power_factor) || 0.85,
      ibAmperes: Number(c.ib_amperes) || 0,
      inAmperes: Number(c.in_amperes) || 0,
      cableSectionMm2: Number(c.cable_section_mm2) || 2.5,
      cableLengthM: Number(c.cable_length_m) || 15,
      cableInsulation: c.cable_insulation || 'PVC 70°C',
      installationMethod: c.installation_method || 'B1',
      groupingFactor: Number(c.grouping_factor) || 1.0,
      tempFactor: Number(c.temp_factor) || 1.0,
      voltageDropPercent: Number(c.voltage_drop_percent) || 0,
      breakerModel: c.breaker_model || undefined,
      protectionDevice: c.protection_device || undefined,
      description: c.description || undefined,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));
  } catch (err) {
    console.error('Erro ao ler circuitos do projeto:', err);
    return [];
  }
}

export async function saveProjectCircuit(circuit: ElectricalCircuit): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase não configurado' };

  try {
    const supabase = createClient();
    const payload = {
      id: circuit.id,
      tenant_id: circuit.tenantId,
      project_id: circuit.projectId,
      circuit_number: circuit.circuitNumber,
      name: circuit.name,
      panel_tag: circuit.panelTag,
      voltage_v: circuit.voltageV,
      phases: circuit.phases,
      power_kw: circuit.powerKw,
      power_factor: circuit.powerFactor,
      ib_amperes: circuit.ibAmperes,
      in_amperes: circuit.inAmperes,
      cable_section_mm2: circuit.cableSectionMm2,
      cable_length_m: circuit.cableLengthM,
      cable_insulation: circuit.cableInsulation,
      installation_method: circuit.installationMethod,
      grouping_factor: circuit.groupingFactor,
      temp_factor: circuit.tempFactor,
      voltage_drop_percent: circuit.voltageDropPercent,
      breaker_model: circuit.breakerModel || null,
      protection_device: circuit.protectionDevice || null,
      description: circuit.description || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('circuits').upsert(payload);
    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha ao salvar circuito';
    return { success: false, error: msg };
  }
}

export async function deleteProjectCircuit(circuitId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase não configurado' };

  try {
    const supabase = createClient();
    const { error } = await supabase.from('circuits').delete().eq('id', circuitId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha ao excluir circuito';
    return { success: false, error: msg };
  }
}

// ==========================================
// UNIVERSAL SYMBOL LIBRARY PERSISTENCE
// ==========================================

export async function getUniversalSymbols(category?: string): Promise<UniversalSymbol[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const supabase = createClient();
    let query = supabase.from('symbol_library').select('*');
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map(s => ({
      id: s.id,
      tenantId: s.tenant_id,
      category: s.category,
      subcategory: s.subcategory || undefined,
      standard: (s.standard as UniversalSymbol['standard']) || 'ABNT_NBR',
      name: s.name,
      description: s.description || undefined,
      viewBox: s.view_box,
      svgPaths: s.svg_paths,
      defaultProperties: (s.default_properties || {}) as Record<string, unknown>,
      connectionPoints: (s.connection_points || []) as UniversalSymbol['connectionPoints'],
      validationRules: (s.validation_rules || {}) as Record<string, unknown>,
      manufacturer: s.manufacturer || undefined,
      model: s.model || undefined,
      datasheetUrl: s.datasheet_url || undefined,
      isGlobal: Boolean(s.is_global),
      version: s.version,
    }));
  } catch (err) {
    console.error('Erro ao ler biblioteca de símbolos:', err);
    return [];
  }
}

export async function saveCustomSymbol(symbol: UniversalSymbol): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase não configurado' };

  try {
    const supabase = createClient();
    const payload = {
      id: symbol.id,
      tenant_id: symbol.tenantId || null,
      category: symbol.category,
      subcategory: symbol.subcategory || null,
      standard: symbol.standard,
      name: symbol.name,
      description: symbol.description || null,
      view_box: symbol.viewBox,
      svg_paths: symbol.svgPaths,
      default_properties: symbol.defaultProperties as unknown as import('@/types/supabase').Json,
      connection_points: symbol.connectionPoints as unknown as import('@/types/supabase').Json,
      validation_rules: symbol.validationRules as unknown as import('@/types/supabase').Json,
      manufacturer: symbol.manufacturer || null,
      model: symbol.model || null,
      datasheet_url: symbol.datasheetUrl || null,
      is_global: symbol.isGlobal,
      version: symbol.version,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('symbol_library').upsert(payload);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha ao salvar símbolo';
    return { success: false, error: msg };
  }
}

// ==========================================
// ENGINEERING AUDIT LOG PERSISTENCE
// ==========================================

export async function recordEngineeringAuditLog(
  log: Omit<EngineeringAuditLog, 'id' | 'createdAt'>
): Promise<void> {
  if (!isSupabaseConfigured || !log.tenantId) return;

  try {
    const supabase = createClient();
    const payload = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tenant_id: log.tenantId,
      project_id: log.projectId || null,
      user_id: log.userId || null,
      user_name: log.userName,
      action: log.action,
      target_entity: log.targetEntity,
      entity_id: log.entityId || null,
      changes: log.changes as unknown as import('@/types/supabase').Json,
      ip_address: log.ipAddress || null,
      created_at: new Date().toISOString(),
    };

    await supabase.from('engineering_audit_logs').insert(payload);
  } catch (err) {
    console.warn('Erro ao registrar log de auditoria no Supabase:', err);
  }
}

export async function getProjectAuditLogs(projectId: string): Promise<EngineeringAuditLog[]> {
  if (!isSupabaseConfigured || !projectId) return [];

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('engineering_audit_logs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) return [];

    return data.map(l => ({
      id: l.id,
      tenantId: l.tenant_id,
      projectId: l.project_id,
      userId: l.user_id || undefined,
      userName: l.user_name,
      action: l.action as EngineeringAuditLog['action'],
      targetEntity: l.target_entity as EngineeringAuditLog['targetEntity'],
      entityId: l.entity_id || undefined,
      changes: (l.changes || {}) as Record<string, unknown>,
      ipAddress: l.ip_address || undefined,
      createdAt: l.created_at,
    }));
  } catch {
    return [];
  }
}

// ==========================================
// TECHNICAL DOCUMENTS REAL PERSISTENCE
// ==========================================

export async function getProjectDocuments(projectId: string): Promise<TechnicalDocument[]> {
  if (!isSupabaseConfigured || !projectId) return [];

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('technical_documents')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(d => ({
      id: d.id,
      tenantId: d.tenant_id,
      projectId: d.project_id,
      name: d.name,
      fileName: d.file_name,
      fileType: d.file_type,
      fileSizeBytes: Number(d.file_size_bytes) || 0,
      fileSha256: d.file_sha256,
      storagePath: d.storage_path,
      status: (d.status as TechnicalDocument['status']) || 'UPLOADED',
      pageCount: d.page_count,
      manufacturer: d.manufacturer,
      equipmentModel: d.equipment_model,
      equipmentCategory: d.equipment_category,
      metadata: (d.metadata || {}) as Record<string, unknown>,
      createdBy: d.created_by,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  } catch (err) {
    console.error('Erro ao ler documentos técnicos:', err);
    return [];
  }
}

export async function saveProjectDocument(
  doc: Omit<TechnicalDocument, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; document?: TechnicalDocument; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase não configurado' };

  try {
    const supabase = createClient();
    const id = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    const payload = {
      id,
      tenant_id: doc.tenantId,
      project_id: doc.projectId || null,
      name: doc.name,
      file_name: doc.fileName,
      file_type: doc.fileType,
      file_size_bytes: doc.fileSizeBytes,
      file_sha256: doc.fileSha256,
      storage_path: doc.storagePath || null,
      status: doc.status,
      page_count: doc.pageCount,
      manufacturer: doc.manufacturer || null,
      equipment_model: doc.equipmentModel || null,
      equipment_category: doc.equipmentCategory || null,
      metadata: (doc.metadata || {}) as unknown as import('@/types/supabase').Json,
      created_by: doc.createdBy || null,
      created_at: nowIso,
      updated_at: nowIso,
    };

    const { error } = await supabase.from('technical_documents').insert(payload);
    if (error) return { success: false, error: error.message };

    return {
      success: true,
      document: {
        ...doc,
        id,
        createdAt: nowIso,
        updatedAt: nowIso,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha ao salvar documento';
    return { success: false, error: msg };
  }
}

export async function getExtractedEntities(documentId: string): Promise<ExtractedTechnicalEntity[]> {
  if (!isSupabaseConfigured || !documentId) return [];

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('extracted_entities')
      .select('*')
      .eq('document_id', documentId)
      .order('page_number', { ascending: true });

    if (error || !data) return [];

    return data.map(e => ({
      id: e.id,
      tenantId: e.tenant_id,
      documentId: e.document_id,
      projectId: e.project_id,
      entityType: e.entity_type,
      propertyName: e.property_name,
      propertyValue: e.property_value,
      unit: e.unit,
      confidence: (e.confidence as ExtractedTechnicalEntity['confidence']) || 'HIGH',
      pageNumber: e.page_number,
      sectionTitle: e.section_title,
      tableIndex: e.table_index,
      originalSnippet: e.original_snippet,
      isVerified: Boolean(e.is_verified),
      verifiedBy: e.verified_by,
      verifiedAt: e.verified_at,
      createdAt: e.created_at,
    }));
  } catch (err) {
    console.error('Erro ao ler entidades extraídas:', err);
    return [];
  }
}
