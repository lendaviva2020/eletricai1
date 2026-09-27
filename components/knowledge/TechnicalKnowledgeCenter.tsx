'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import { getProjectDocuments, getExtractedEntities } from '@/lib/supabase/service';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import type { TechnicalDocument, ExtractedTechnicalEntity } from '@/lib/engineering/core/types';
import {
  BookOpenText,
  ChevronRight,
  DatabaseZap,
  FileSearch,
  FileText,
  FolderOpen,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldQuestion,
  X,
} from 'lucide-react';

interface TechnicalKnowledgeCenterProps {
  projectId?: string;
}

const CONFIDENCE_STYLES: Record<ExtractedTechnicalEntity['confidence'], string> = {
  HIGH: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  MEDIUM: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  LOW: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
};

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return 'DADO_NAO_INFORMADO';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'DADO_NAO_INFORMADO';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'DADO_NAO_INFORMADO';
  return date.toLocaleString('pt-BR');
}

function formatEntityLabel(entity: ExtractedTechnicalEntity): string {
  return `${entity.propertyName}${entity.unit ? ` (${entity.unit})` : ''}`;
}

export function TechnicalKnowledgeCenter({ projectId }: TechnicalKnowledgeCenterProps) {
  const { activeProject } = useWorkspace();
  const resolvedProjectId = projectId ?? activeProject?.id ?? null;

  const [reloadToken, setReloadToken] = useState(0);
  const [documentsByProject, setDocumentsByProject] = useState<{
    projectId: string;
    documents: TechnicalDocument[];
  } | null>(null);
  const [entitiesByDocument, setEntitiesByDocument] = useState<{
    documentId: string;
    entities: ExtractedTechnicalEntity[];
  } | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [evidenceEntity, setEvidenceEntity] = useState<ExtractedTechnicalEntity | null>(null);

  const documents = useMemo(
    () =>
      documentsByProject && documentsByProject.projectId === resolvedProjectId
        ? documentsByProject.documents
        : null,
    [documentsByProject, resolvedProjectId]
  );

  const selectedDocument = useMemo(
    () => documents?.find(d => d.id === selectedDocumentId) ?? documents?.[0] ?? null,
    [documents, selectedDocumentId]
  );

  const activeDocumentId = selectedDocument?.id ?? null;

  const entities = useMemo(
    () =>
      entitiesByDocument && entitiesByDocument.documentId === activeDocumentId
        ? entitiesByDocument.entities
        : null,
    [entitiesByDocument, activeDocumentId]
  );

  const isLoadingDocuments = resolvedProjectId !== null && documents === null;
  const isLoadingEntities = activeDocumentId !== null && entities === null;

  useEffect(() => {
    if (!resolvedProjectId) return;
    const projectId = resolvedProjectId;
    let cancelled = false;

    getProjectDocuments(projectId)
      .then(docs => {
        if (cancelled) return;
        setDocumentsByProject({ projectId, documents: docs });
        setLoadError(null);
      })
      .catch(err => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : 'Falha ao carregar documentos técnicos.');
      });

    return () => {
      cancelled = true;
    };
  }, [resolvedProjectId, reloadToken]);

  useEffect(() => {
    if (!activeDocumentId) return;
    const documentId = activeDocumentId;
    let cancelled = false;

    getExtractedEntities(documentId)
      .then(list => {
        if (cancelled) return;
        setEntitiesByDocument({ documentId, entities: list });
        setLoadError(null);
      })
      .catch(err => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : 'Falha ao carregar entidades extraídas.');
      });

    return () => {
      cancelled = true;
    };
  }, [activeDocumentId, reloadToken]);

  const filteredEntities = useMemo(() => {
    const list = entities ?? [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      e =>
        e.propertyName.toLowerCase().includes(term) ||
        e.propertyValue.toLowerCase().includes(term) ||
        e.entityType.toLowerCase().includes(term) ||
        (e.unit ?? '').toLowerCase().includes(term)
    );
  }, [entities, searchTerm]);

  const renderEmptyState = (icon: React.ReactNode, title: string, description: string) => (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="h-11 w-11 rounded-xl bg-[#0D1017] border border-[#232833] text-slate-500 flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-sm font-bold text-slate-200">{title}</p>
      <p className="text-[11px] text-slate-500 font-mono mt-1 max-w-sm leading-relaxed">{description}</p>
    </div>
  );

  return (
    <div className="bg-[#161A22] border border-[#232833] rounded-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-[#232833]">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <BookOpenText className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">Knowledge Center &amp; Rastreabilidade de Datasheets</h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Especificações extraídas com vínculo para página e trecho de origem
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isSupabaseConfigured && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <DatabaseZap className="h-3 w-3" />
              SUPABASE_NAO_CONFIGURADO
            </span>
          )}
          <button
            type="button"
            onClick={() => setReloadToken(token => token + 1)}
            disabled={!resolvedProjectId || isLoadingDocuments}
            className="p-2 rounded-lg bg-[#0D1017] border border-[#232833] text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Recarregar documentos do projeto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingDocuments ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loadError && (
        <div className="px-4 sm:px-5 py-2.5 border-b border-rose-500/20 bg-rose-500/5 text-[11px] font-mono text-rose-400">
          {loadError}
        </div>
      )}

      {!resolvedProjectId
        ? renderEmptyState(
            <FolderOpen className="h-5 w-5" />,
            'Nenhum projeto ativo',
            'Abra ou selecione um projeto no Workspace para consultar a base de conhecimento técnico.'
          )
        : documents !== null && documents.length === 0
          ? renderEmptyState(
              <FileSearch className="h-5 w-5" />,
              'Nenhum documento técnico indexado',
              isSupabaseConfigured
                ? 'A tabela technical_documents está vazia para este projeto. Nenhum dado de exemplo é exibido.'
                : 'Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY para consultar documentos reais.'
            )
          : (
            <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] min-h-0">
              {/* Document list */}
              <div className="border-b lg:border-b-0 lg:border-r border-[#232833] max-h-64 lg:max-h-[520px] overflow-y-auto">
                {isLoadingDocuments && (
                  <div className="flex items-center gap-2 px-4 py-4 text-[11px] font-mono text-slate-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Carregando documentos...
                  </div>
                )}
                {(documents ?? []).map(doc => {
                  const isActive = doc.id === activeDocumentId;
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSelectedDocumentId(doc.id)}
                      className={`w-full text-left px-4 py-3 border-b border-[#1F2633] transition-colors flex items-start gap-2.5 ${
                        isActive ? 'bg-cyan-500/5' : 'hover:bg-[#12161F]/60'
                      }`}
                    >
                      <FileText
                        className={`h-4 w-4 mt-0.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className={`block text-xs font-semibold truncate ${isActive ? 'text-cyan-300' : 'text-slate-200'}`}>
                          {doc.name}
                        </span>
                        <span className="block text-[10px] font-mono text-slate-500 truncate">
                          {doc.manufacturer ?? 'Fabricante: DADO_NAO_INFORMADO'}
                          {doc.equipmentModel ? ` · ${doc.equipmentModel}` : ''}
                        </span>
                        <span className="block text-[10px] font-mono text-slate-600">
                          {doc.pageCount} pág. · {formatBytes(doc.fileSizeBytes)} · {doc.status}
                        </span>
                      </span>
                      <ChevronRight className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-700'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Entities */}
              <div className="flex flex-col min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-[#232833]">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-100 truncate">
                      {selectedDocument ? selectedDocument.name : 'Selecione um documento'}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">
                      SHA-256: <span className="text-slate-400">{selectedDocument?.fileSha256 ?? 'DADO_NAO_INFORMADO'}</span>
                    </p>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Filtrar especificação..."
                      className="w-56 pl-8 pr-3 py-1.5 rounded-lg bg-[#0D1017] border border-[#232833] text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>

                <div className="max-h-[420px] overflow-y-auto">
                  {isLoadingEntities ? (
                    <div className="flex items-center gap-2 px-5 py-6 text-[11px] font-mono text-slate-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Extraindo entidades indexadas...
                    </div>
                  ) : filteredEntities.length === 0 ? (
                    renderEmptyState(
                      <FileSearch className="h-5 w-5" />,
                      entities?.length === 0 ? 'Nenhuma especificação extraída' : 'Nenhum resultado para o filtro',
                      (entities?.length ?? 0) === 0
                        ? 'Este documento ainda não possui entidades técnicas indexadas no banco.'
                        : 'Ajuste o termo de busca para localizar a propriedade desejada.'
                    )
                  ) : (
                    <table className="w-full text-left">
                      <thead className="sticky top-0 bg-[#0D1017]">
                        <tr className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                          <th className="px-4 py-2 font-semibold">Propriedade</th>
                          <th className="px-4 py-2 font-semibold">Valor</th>
                          <th className="px-4 py-2 font-semibold hidden sm:table-cell">Página</th>
                          <th className="px-4 py-2 font-semibold hidden md:table-cell">Confiança</th>
                          <th className="px-4 py-2 font-semibold hidden md:table-cell">Verificado</th>
                          <th className="px-4 py-2 font-semibold text-right">Evidência</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1F2633]">
                        {filteredEntities.map(entity => (
                          <tr key={entity.id} className="hover:bg-[#12161F]/60 transition-colors">
                            <td className="px-4 py-2.5 text-xs text-slate-300 font-medium">
                              {formatEntityLabel(entity)}
                              <span className="block text-[10px] font-mono text-slate-600">{entity.entityType}</span>
                            </td>
                            <td className="px-4 py-2.5 text-xs font-mono text-cyan-300">{entity.propertyValue}</td>
                            <td className="px-4 py-2.5 text-[11px] font-mono text-slate-400 hidden sm:table-cell">
                              {entity.pageNumber}
                            </td>
                            <td className="px-4 py-2.5 hidden md:table-cell">
                              <span
                                className={`inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded border ${CONFIDENCE_STYLES[entity.confidence]}`}
                              >
                                {entity.confidence}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 hidden md:table-cell">
                              {entity.isVerified ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                                  <ShieldCheck className="h-3 w-3" />
                                  SIM
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500">
                                  <ShieldQuestion className="h-3 w-3" />
                                  NÃO
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => setEvidenceEntity(entity)}
                                className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[11px] font-mono transition-colors"
                              >
                                Ver Evidência
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="px-4 sm:px-5 py-2.5 border-t border-[#232833] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-500">
                  <span>
                    {filteredEntities.length} de {entities?.length ?? 0} especificações
                  </span>
                  <span>
                    Atualizado: {formatDate(selectedDocument?.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          )}

      {/* Evidence modal */}
      {evidenceEntity && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Evidência da especificação"
        >
          <div className="w-full max-w-2xl bg-[#161A22] border border-[#232833] rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#232833]">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <FileSearch className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">Evidência da Especificação</p>
                  <p className="text-[10px] font-mono text-slate-500">
                    {selectedDocument?.name ?? 'DADO_NAO_INFORMADO'} · pág. {evidenceEntity.pageNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEvidenceEntity(null)}
                className="p-1.5 rounded-lg bg-[#0D1017] border border-[#232833] text-slate-400 hover:text-slate-200 transition-colors"
                aria-label="Fechar evidência"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#0D1017] border border-[#232833] rounded-lg p-2.5">
                  <p className="text-[10px] font-mono uppercase text-slate-500">Propriedade</p>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5">{formatEntityLabel(evidenceEntity)}</p>
                </div>
                <div className="bg-[#0D1017] border border-[#232833] rounded-lg p-2.5">
                  <p className="text-[10px] font-mono uppercase text-slate-500">Valor</p>
                  <p className="text-xs font-mono text-cyan-300 mt-0.5">{evidenceEntity.propertyValue}</p>
                </div>
                <div className="bg-[#0D1017] border border-[#232833] rounded-lg p-2.5">
                  <p className="text-[10px] font-mono uppercase text-slate-500">Página</p>
                  <p className="text-xs font-mono text-slate-200 mt-0.5">{evidenceEntity.pageNumber}</p>
                </div>
                <div className="bg-[#0D1017] border border-[#232833] rounded-lg p-2.5">
                  <p className="text-[10px] font-mono uppercase text-slate-500">Confiança</p>
                  <p className="text-xs font-mono text-slate-200 mt-0.5">{evidenceEntity.confidence}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-mono uppercase text-slate-500 mb-1.5">Seção de origem</p>
                <p className="text-xs text-slate-300 font-mono">
                  {evidenceEntity.sectionTitle ?? 'DADO_NAO_INFORMADO'}
                  {evidenceEntity.tableIndex != null ? ` · Tabela #${evidenceEntity.tableIndex}` : ''}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-mono uppercase text-slate-500">Trecho original (conteúdo não confiável)</p>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400">
                    CONTEUDO_NAO_CONFIADO
                  </span>
                </div>
                <pre className="bg-[#0D1017] border border-[#232833] rounded-lg p-3 text-[11px] font-mono text-slate-300 whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
                  {evidenceEntity.originalSnippet?.trim() || 'DADO_NAO_INFORMADO'}
                </pre>
              </div>

              <p className="text-[10px] font-mono text-slate-500">
                Extraído de: {selectedDocument?.fileName ?? 'DADO_NAO_INFORMADO'} · SHA-256{' '}
                {selectedDocument?.fileSha256 ?? 'DADO_NAO_INFORMADO'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TechnicalKnowledgeCenter;
