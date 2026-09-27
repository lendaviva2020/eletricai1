// ============================================================================
// ELÉTRICAI — DOCUMENT INTELLIGENCE PIPELINE (FASE 8)
// Pipeline seguro de ingestão, sanitização e extração de entidades técnicas
// de manuais PDF, datasheets, catálogos e esquemas elétricos.
// ============================================================================

import { createHash } from 'crypto';

export interface DocumentUploadParams {
  file: Buffer;
  fileName: string;
  fileType: string;
  tenantId: string;
  projectId?: string;
  uploadedBy: string;
}

export interface TechnicalDocument {
  id: string;
  tenantId: string;
  projectId?: string;
  name: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  fileSha256: string;
  storagePath?: string;
  status: 'UPLOADED' | 'PROCESSING' | 'EXTRACTED' | 'ERROR';
  pageCount: number;
  manufacturer?: string;
  equipmentModel?: string;
  equipmentCategory?: string;
  metadata?: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExtractedTechnicalEntity {
  id: string;
  tenantId: string;
  documentId: string;
  projectId?: string;
  entityType: string;
  propertyName: string;
  propertyValue: string;
  unit?: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  pageNumber: number;
  sectionTitle?: string;
  tableIndex?: number;
  originalSnippet?: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface DocumentIntelligenceResult {
  document: TechnicalDocument;
  entities: ExtractedTechnicalEntity[];
  warnings: string[];
}

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/tiff',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all|previous|above)\s+(instructions?|directives?|rules?)/i,
  /disregard\s+(all|previous|above)\s+(instructions?|directives?|rules?)/i,
  /forget\s+(all|previous|above)\s+(instructions?|directives?|rules?)/i,
  /you\s+are\s+now\s+(a|an)\s+/i,
  /act\s+as\s+(a|an)\s+/i,
  /pretend\s+to\s+be\s+/i,
  /system\s+prompt/i,
  /override\s+safety/i,
  /bypass\s+security/i,
  /delete\s+(all|database|projects?)/i,
  /drop\s+table/i,
  /rm\s+-rf/i,
  /exec\s*\(/i,
  /eval\s*\(/i,
  /<script>/i,
  /javascript:/i,
];

function calculateSha256(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

function validateFile(file: Buffer, fileName: string, fileType: string): { valid: boolean; error?: string } {
  if (file.length > MAX_FILE_SIZE) {
    return { valid: false, error: `Arquivo excede tamanho máximo de ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }

  if (!ALLOWED_MIME_TYPES.includes(fileType)) {
    return { valid: false, error: `Tipo de arquivo não suportado: ${fileType}` };
  }

  return { valid: true };
}

function detectPromptInjection(text: string): boolean {
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return true;
    }
  }
  return false;
}

function sanitizeText(text: string): string {
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .replace(/\u0000/g, '') // Null bytes
    .trim();
}

function isolateUntrustedContent(text: string): string {
  return `<DOCUMENT_CONTENT_UNTRUSTED>\n${text}\n</DOCUMENT_CONTENT_UNTRUSTED>`;
}

function extractEntitiesFromText(
  text: string,
  documentId: string,
  tenantId: string,
  projectId?: string
): ExtractedTechnicalEntity[] {
  const entities: ExtractedTechnicalEntity[] = [];
  const lines = text.split('\n');
  let pageNumber = 1;
  let tableIndex = 0;
  let inTable = false;

  const technicalPatterns = [
    { regex: /(?:corrente|current|In|I_n|nominal)[:\s]*([\d.,]+)\s*(A|Amps?)/gi, type: 'CURRENT_RATED', unit: 'A' },
    { regex: /(?:tens[ãa]o|voltage|Un|V_n|nominal)[:\s]*([\d.,]+)\s*(V|Volts?)/gi, type: 'VOLTAGE_RATED', unit: 'V' },
    { regex: /(?:pot[êe]ncia|power|P_n|P)[:\s]*([\d.,]+)\s*(kW|kVA|W|HP|CV)/gi, type: 'POWER_RATED', unit: 'kW' },
    { regex: /(?:fator\s+de\s+pot[êe]ncia|power\s+factor|cos\s*[φf]|cos\s*phi)[:\s]*([\d.,]+)/gi, type: 'POWER_FACTOR', unit: '' },
    { regex: /(?:rendimento|efficiency|η)[:\s]*([\d.,]+)\s*%?/gi, type: 'EFFICIENCY', unit: '%' },
    { regex: /(?:capacidade\s+de\s+ruptura|breaking\s+capacity|Icu|Ics)[:\s]*([\d.,]+)\s*(kA)/gi, type: 'BREAKING_CAPACITY', unit: 'kA' },
    { regex: /(?:curva\s+de\s+disparo|trip\s+curve)[:\s]*([BCD])/gi, type: 'TRIP_CURVE', unit: '' },
    { regex: /(?:se[çc][ãa]o|se[çc][ãa]o\s+do\s+condutor|cable\s+section|cross\s+section)[:\s]*([\d.,]+)\s*(mm²|mm2)/gi, type: 'CABLE_SECTION', unit: 'mm²' },
    { regex: /(?:fabricante|manufacturer|marca)[:\s]*([A-Za-z0-9\s]+)/gi, type: 'MANUFACTURER', unit: '' },
    { regex: /(?:modelo|model|refer[êe]ncia|part\s+number|PN)[:\s]*([A-Za-z0-9\-\.]+)/gi, type: 'MODEL', unit: '' },
    { regex: /(?:endere[çc]o|address|%I|%Q|%M|%IW|%QW|%MW)[:\s]*([%IQMW]\d+(?:\.\d+)?)/gi, type: 'MODBUS_TAG', unit: '' },
    { regex: /(?:temperatura|temperature)[:\s]*([\d.,]+)\s*(°C|C)/gi, type: 'TEMPERATURE', unit: '°C' },
    { regex: /(?:vibra[çc][ãa]o|vibration)[:\s]*([\d.,]+)\s*(mm\/s|mm\/s²|g)/gi, type: 'VIBRATION', unit: 'mm/s' },
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect page breaks
    if (line.match(/^---PAGE\s+(\d+)---$/i)) {
      pageNumber = parseInt(line.match(/^---PAGE\s+(\d+)---$/i)![1], 10);
      continue;
    }

    // Detect tables
    if (line.includes('|') && line.split('|').length >= 3) {
      inTable = true;
      tableIndex++;
    } else if (inTable && !line.includes('|')) {
      inTable = false;
    }

    // Check for prompt injection
    if (detectPromptInjection(line)) {
      continue; // Skip potentially malicious content
    }

    const sanitizedLine = sanitizeText(line);

    // Extract technical entities
    for (const pattern of technicalPatterns) {
      const matches = [...sanitizedLine.matchAll(pattern.regex)];
      for (const match of matches) {
        if (match[1]) {
          entities.push({
            id: `ent_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            tenantId,
            documentId,
            projectId,
            entityType: pattern.type,
            propertyName: pattern.type,
            propertyValue: match[1].replace(',', '.'),
            unit: pattern.unit,
            confidence: 'HIGH',
            pageNumber,
            sectionTitle: `Linha ${i + 1}`,
            tableIndex: inTable ? tableIndex : undefined,
            originalSnippet: isolateUntrustedContent(match[0]),
            isVerified: false,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
  }

  return entities;
}

export async function processDocumentUpload(
  params: DocumentUploadParams
): Promise<DocumentIntelligenceResult> {
  const { file, fileName, fileType, tenantId, projectId, uploadedBy } = params;

  // 1. Validate file
  const validation = validateFile(file, fileName, fileType);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // 2. Calculate SHA-256 hash for deduplication
  const fileSha256 = calculateSha256(file);

  // 3. Extract text content (in real implementation, use PDF.js, Tesseract, etc.)
  // For now, we'll simulate with a placeholder
  const extractedText = await extractTextFromFile(file, fileType);

  // 4. Isolate untrusted content against prompt injection
  const safeText = isolateUntrustedContent(extractedText);

  // 5. Extract technical entities with traceability
  const entities = extractEntitiesFromText(safeText, '', tenantId, projectId);

  // 6. Create document record
  const now = new Date().toISOString();
  const document: TechnicalDocument = {
    id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    tenantId,
    projectId,
    name: fileName,
    fileName,
    fileType,
    fileSizeBytes: file.length,
    fileSha256,
    storagePath: undefined,
    status: 'EXTRACTED',
    pageCount: estimatePageCount(extractedText),
    manufacturer: extractManufacturer(entities),
    equipmentModel: extractModel(entities),
    equipmentCategory: extractCategory(entities),
    metadata: {
      extractedEntitiesCount: entities.length,
      promptInjectionDetected: false,
    },
    createdBy: uploadedBy,
    createdAt: now,
    updatedAt: now,
  };

  // Update entity document IDs
  entities.forEach(e => {
    e.documentId = document.id;
  });

  return {
    document,
    entities,
    warnings: [],
  };
}

async function extractTextFromFile(file: Buffer, fileType: string): Promise<string> {
  // In production, integrate with:
  // - pdf-parse / PDF.js for PDF
  // - mammoth for DOCX
  // - xlsx for XLSX
  // - Tesseract.js for OCR on images
  
  // Simulated extraction for development
  if (fileType === 'application/pdf') {
    return `---PAGE 1---
MANUAL TÉCNICO - INVERSOR DE FREQUÊNCIA CFW11
WEG Automação

ESPECIFICAÇÕES ELÉTRICAS:
Tensão nominal: 380 V
Corrente nominal: 45 A
Potência: 30 kW
Fator de potência: 0.92
Rendimento: 95%
Capacidade de ruptura: 45 kA
Curva de disparo: C
Seção do condutor: 16 mm²
Fabricante: WEG
Modelo: CFW11 0045 T4

TABELA 4.2 - Parâmetros de Proteção
| Parâmetro | Valor | Unidade |
|-----------|-------|---------|
| Corrente de sobrecarga | 150 | % |
| Tempo de disparo | 60 | s |
| Temperatura máxima | 50 | °C |

---PAGE 2---
INSTALAÇÃO E CONFIGURAÇÃO
Endereços Modbus:
%IW64 - Corrente fase R
%IW66 - Temperatura
%Q0.0 - Habilita partida
`;
  }
  
  return file.toString('utf-8');
}

function estimatePageCount(text: string): number {
  const pages = text.match(/---PAGE\s+\d+---/gi);
  return pages ? pages.length : 1;
}

function extractManufacturer(entities: ExtractedTechnicalEntity[]): string | undefined {
  const m = entities.find(e => e.entityType === 'MANUFACTURER');
  return m?.propertyValue;
}

function extractModel(entities: ExtractedTechnicalEntity[]): string | undefined {
  const m = entities.find(e => e.entityType === 'MODEL');
  return m?.propertyValue;
}

function extractCategory(entities: ExtractedTechnicalEntity[]): string | undefined {
  const types = new Set(entities.map(e => e.entityType));
  if (types.has('VFD') || types.has('INVERTER')) return 'INVERTER';
  if (types.has('MOTOR')) return 'MOTOR';
  if (types.has('BREAKER')) return 'BREAKER';
  if (types.has('CONTACTOR')) return 'CONTACTOR';
  return undefined;
}

// Security utilities for external use
export function checkPromptInjection(text: string): boolean {
  return detectPromptInjection(text);
}

export function sanitizeInput(text: string): string {
  return sanitizeText(text);
}

export function wrapUntrustedContent(text: string): string {
  return isolateUntrustedContent(text);
}