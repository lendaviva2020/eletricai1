// ==========================================
// ELÉTRICAI — ENGINEERING CORE 4.0 UNIFIED TYPES
// ==========================================

import {
  ElectricalComponent,
  ElectricalConnection,
  SharedTag,
  LadderRung,
} from '@/types/electrical';

export interface ProjectRevision {
  id: string;
  projectId: string;
  tenantId: string;
  revisionNumber: number;
  revisionCode: string; // e.g. 'REV-00', 'REV-01'
  title: string;
  description?: string;
  snapshotData: {
    components: ElectricalComponent[];
    connections: ElectricalConnection[];
    sharedTags: SharedTag[];
    ladderRungs: LadderRung[];
    circuits?: ElectricalCircuit[];
  };
  componentsCount: number;
  connectionsCount: number;
  createdById?: string;
  authorName: string;
  creaArt?: string;
  createdAt: string;
}

export interface ElectricalCircuit {
  id: string;
  projectId: string;
  tenantId: string;
  circuitNumber: string; // 'C01', 'ALIM-01'
  name: string;
  panelTag: string; // 'QGBT-01', 'CCM-01'
  voltageV: number;
  phases: '1F' | '2F' | '3F' | '3F+N' | '3F+N+PE' | 'DC';
  powerKw: number;
  powerFactor: number;
  ibAmperes: number;
  inAmperes: number;
  cableSectionMm2: number;
  cableLengthM: number;
  cableInsulation: string;
  installationMethod: string; // 'B1', 'B2', 'C', 'D'
  groupingFactor: number;
  tempFactor: number;
  voltageDropPercent: number;
  breakerModel?: string;
  protectionDevice?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UniversalSymbol {
  id: string;
  tenantId?: string | null;
  category: string;
  subcategory?: string;
  standard: 'ABNT_NBR' | 'IEC_60617' | 'ANSI_IEEE';
  name: string;
  description?: string;
  viewBox: string;
  svgPaths: string;
  defaultProperties: Record<string, unknown>;
  connectionPoints: Array<{
    id: string;
    terminalNumber: string;
    relativeX: number;
    relativeY: number;
    direction: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';
    allowedPinTypes: string[];
  }>;
  validationRules: Record<string, unknown>;
  manufacturer?: string;
  model?: string;
  datasheetUrl?: string;
  isGlobal: boolean;
  version: string;
}

export interface EngineeringAuditLog {
  id: string;
  tenantId: string;
  projectId?: string | null;
  userId?: string;
  userName: string;
  action: 'CREATE_PROJECT' | 'MUTATE_TOPOLOGY' | 'CALCULATE_CABLES' | 'AI_SYNTHESIS' | 'SAVE_SNAPSHOT' | 'EMIT_REVISION';
  targetEntity: 'COMPONENT' | 'CONNECTION' | 'RUNG' | 'CIRCUIT' | 'REVISION';
  entityId?: string;
  changes: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface CrossReferenceMap {
  [componentTag: string]: {
    componentId: string;
    circuitNumber?: string;
    panelTag?: string;
    ladderRungIds: string[];
    plcChannelAddresses: string[];
    scadaTagNames: string[];
    upstreamProtectorTag?: string;
    downstreamLoads: string[];
  };
}

export interface TechnicalDocument {
  id: string;
  tenantId: string;
  projectId?: string | null;
  name: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  fileSha256: string;
  storagePath?: string | null;
  status: 'UPLOADED' | 'PROCESSING' | 'EXTRACTED' | 'ERROR';
  pageCount: number;
  manufacturer?: string | null;
  equipmentModel?: string | null;
  equipmentCategory?: string | null;
  metadata?: Record<string, unknown>;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExtractedTechnicalEntity {
  id: string;
  tenantId: string;
  documentId: string;
  projectId?: string | null;
  entityType: string;
  propertyName: string;
  propertyValue: string;
  unit?: string | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  pageNumber: number;
  sectionTitle?: string | null;
  tableIndex?: number | null;
  originalSnippet?: string | null;
  isVerified: boolean;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
}
