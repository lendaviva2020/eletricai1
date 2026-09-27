import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TechnicalKnowledgeCenter } from '@/components/knowledge/TechnicalKnowledgeCenter';
import { getProjectDocuments, getExtractedEntities } from '@/lib/supabase/service';
import type { TechnicalDocument, ExtractedTechnicalEntity } from '@/lib/engineering/core/types';

jest.mock('@/components/shared/WorkspaceContext', () => ({
  useWorkspace: () => ({ activeProject: { id: 'prj_test_1' } }),
}));

jest.mock('@/lib/supabase/service', () => ({
  getProjectDocuments: jest.fn(),
  getExtractedEntities: jest.fn(),
}));

const mockedGetDocuments = jest.mocked(getProjectDocuments);
const mockedGetEntities = jest.mocked(getExtractedEntities);

const makeDocument = (overrides: Partial<TechnicalDocument> = {}): TechnicalDocument => ({
  id: 'doc_1',
  tenantId: 'ten_1',
  projectId: 'prj_test_1',
  name: 'Manual CFW11',
  fileName: 'cfw11.pdf',
  fileType: 'application/pdf',
  fileSizeBytes: 2048,
  fileSha256: 'abc123hash',
  status: 'EXTRACTED',
  pageCount: 2,
  manufacturer: 'WEG',
  equipmentModel: 'CFW11 0045 T4',
  createdBy: 'user_1',
  createdAt: '2026-09-26T10:00:00.000Z',
  updatedAt: '2026-09-26T10:00:00.000Z',
  ...overrides,
});

const makeEntity = (overrides: Partial<ExtractedTechnicalEntity> = {}): ExtractedTechnicalEntity => ({
  id: 'ent_1',
  tenantId: 'ten_1',
  documentId: 'doc_1',
  projectId: 'prj_test_1',
  entityType: 'CURRENT_RATED',
  propertyName: 'CURRENT_RATED',
  propertyValue: '45',
  unit: 'A',
  confidence: 'HIGH',
  pageNumber: 1,
  sectionTitle: 'Linha 6',
  originalSnippet: '<DOCUMENT_CONTENT_UNTRUSTED>\nCorrente nominal: 45 A\n</DOCUMENT_CONTENT_UNTRUSTED>',
  isVerified: false,
  createdAt: '2026-09-26T10:00:00.000Z',
  ...overrides,
});

describe('TechnicalKnowledgeCenter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exibe estado vazio transparente quando o projeto não possui documentos', async () => {
    mockedGetDocuments.mockResolvedValue([]);
    mockedGetEntities.mockResolvedValue([]);

    render(<TechnicalKnowledgeCenter />);

    expect(
      await screen.findByText('Nenhum documento técnico indexado')
    ).toBeInTheDocument();
    expect(mockedGetDocuments).toHaveBeenCalledWith('prj_test_1');
    expect(mockedGetEntities).not.toHaveBeenCalled();
  });

  it('lista documentos e entidades extraídas do projeto', async () => {
    mockedGetDocuments.mockResolvedValue([makeDocument()]);
    mockedGetEntities.mockResolvedValue([makeEntity()]);

    render(<TechnicalKnowledgeCenter />);

    expect((await screen.findAllByText('Manual CFW11')).length).toBeGreaterThan(0);
    expect(await screen.findByText('45')).toBeInTheDocument();
    expect(await screen.findByText('CURRENT_RATED (A)')).toBeInTheDocument();
    expect(mockedGetEntities).toHaveBeenCalledWith('doc_1');
  });

  it('abre a evidência com página, seção e trecho de origem ao clicar em "Ver Evidência"', async () => {
    mockedGetDocuments.mockResolvedValue([makeDocument()]);
    mockedGetEntities.mockResolvedValue([makeEntity()]);

    render(<TechnicalKnowledgeCenter />);

    const evidenceButton = await screen.findByRole('button', { name: 'Ver Evidência' });
    fireEvent.click(evidenceButton);

    expect(await screen.findByText('Evidência da Especificação')).toBeInTheDocument();
    expect(screen.getByText(/pág\. 1/)).toBeInTheDocument();
    expect(screen.getByText('Linha 6')).toBeInTheDocument();
    expect(screen.getByText(/Corrente nominal: 45 A/)).toBeInTheDocument();
    expect(screen.getByText('CONTEUDO_NAO_CONFIADO')).toBeInTheDocument();
  });

  it('filtra especificações pelo termo de busca', async () => {
    mockedGetDocuments.mockResolvedValue([makeDocument()]);
    mockedGetEntities.mockResolvedValue([
      makeEntity(),
      makeEntity({
        id: 'ent_2',
        entityType: 'VOLTAGE_RATED',
        propertyName: 'VOLTAGE_RATED',
        propertyValue: '380',
        unit: 'V',
        pageNumber: 2,
      }),
    ]);

    render(<TechnicalKnowledgeCenter />);

    const filterInput = await screen.findByPlaceholderText('Filtrar especificação...');
    fireEvent.change(filterInput, { target: { value: 'VOLTAGE' } });

    await waitFor(() => {
      expect(screen.getByText('VOLTAGE_RATED (V)')).toBeInTheDocument();
      expect(screen.queryByText('CURRENT_RATED (A)')).not.toBeInTheDocument();
    });
  });

  it('exibe estado de carregamento enquanto as entidades do documento não retornam', async () => {
    mockedGetDocuments.mockResolvedValue([makeDocument()]);
    mockedGetEntities.mockImplementation(() => new Promise(() => {}));

    render(<TechnicalKnowledgeCenter />);

    expect(await screen.findByText('Extraindo entidades indexadas...')).toBeInTheDocument();
  });
});
