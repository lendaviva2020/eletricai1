import { TenantRole } from '@/types/electrical';

export type ProjectStatus = 'EM_EXECUCAO' | 'EM_COMISSIONAMENTO' | 'CONCLUIDO' | 'REVISAO_TECNICA';

export type ProjectType = 'SUBESTACAO_MT' | 'CCM_BT' | 'AUTOMACAO_CLP' | 'QGBT_DISTRIBUICAO' | 'SOLAR_FOTOVOLTAICO';

export interface IndustrialProject {
  id: string;
  name: string;
  code: string;
  type: ProjectType;
  typeLabel: string;
  status: ProjectStatus;
  progressPercent: number;
  lastUpdated: string;
  lastUpdatedTimestamp: number;
  updatedBy: {
    name: string;
    role: TenantRole;
    creaNumber?: string;
  };
  nominalVoltage: string;
  normativeStandard: 'ABNT NBR 5410' | 'ABNT NBR 14039' | 'IEC 60364' | 'NR-10';
  targetTab: 'unifilar' | 'ladder' | 'scada' | 'digital_twin' | 'bom';
  description: string;
}

export type AlertSeverity = 'CRITICO' | 'ATENCAO' | 'RECOMENDACAO' | 'RESOLVIDO';

export interface IndustrialAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  category: 'NBR_5410' | 'CLP_IO' | 'MODBUS_REDE' | 'SOBRECARGA' | 'SEGURANCA_NR10';
  timestamp: string;
  sourceTag?: string;
  componentId?: string;
  targetTab: 'unifilar' | 'ladder' | 'plc' | 'scada' | 'digital_twin' | 'bom' | 'ai_copilot';
  suggestedAction: string;
  isResolved?: boolean;
}

export type ActivityEventType =
  | 'PROJECT_CREATED'
  | 'PROJECT_UPDATED'
  | 'AI_ANALYSIS_EXECUTED'
  | 'REPORT_GENERATED'
  | 'MEMBER_ADDED'
  | 'PROJECT_EXPORTED'
  | 'BREAKER_TRIP'
  | 'CABLE_RESIZED';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    role: TenantRole;
  };
  badgeColor: string;
  targetTab?: 'unifilar' | 'ladder' | 'scada' | 'digital_twin' | 'bom' | 'ai_copilot';
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TenantRole;
  roleTitle: 'Engenheiro Eletricista Sênior' | 'Engenheiro de Automação' | 'Técnico em Eletrotécnica' | 'Coordenador de Manutenção' | 'Administrador da Planta';
  creaNumber?: string;
  status: 'ONLINE' | 'EM_CAMPO' | 'OFFLINE';
  lastActive: string;
  avatarInitials: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'ALERT' | 'AI_PATCH' | 'REPORT' | 'PROJECT';
  targetTab?: 'unifilar' | 'ladder' | 'scada' | 'digital_twin' | 'bom' | 'ai_copilot';
}
