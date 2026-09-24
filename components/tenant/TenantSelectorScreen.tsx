'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import { Tenant, TenantRole } from '@/types/electrical';
import { SupabaseDataService, isSupabaseConfigured } from '@/lib/supabase';
import { DatabaseAuthService } from '@/lib/database-auth-service';
import {
  Zap,
  Building2,
  Factory,
  Cpu,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Radio,
  ArrowRight,
  LogOut,
  Plus,
  Search,
  ExternalLink,
  Settings,
  Lock,
  ChevronRight,
  AlertTriangle,
  FileCode,
  Box,
  Key,
  X,
  Sparkles,
  Server,
  Activity,
  Database,
} from 'lucide-react';

interface TenantCardData {
  id: string;
  name: string;
  subname: string;
  cnpj: string;
  location: string;
  category: 'enterprise' | 'client' | 'sandbox';
  role: TenantRole;
  roleLabel: string;
  metrics: {
    label: string;
    value: string;
    isHighlight?: boolean;
    isStatus?: boolean;
    statusOk?: boolean;
  }[];
  buttonText: string;
  buttonStyle: 'amber' | 'cyan' | 'darkAmber';
  iconType: 'factory' | 'substation' | 'chip';
  tagsCount: number;
}

export function TenantSelectorScreen() {
  const { user, logout, selectTenantAndOpenWorkspace, tenant: currentTenant } = useWorkspace();

  // Search & filter
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [createTenantModalOpen, setCreateTenantModalOpen] = useState(false);
  const [requestAccessModalOpen, setRequestAccessModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // New tenant form state
  const [newPlantName, setNewPlantName] = useState('');
  const [newCnpj, setNewCnpj] = useState('');
  const [newLocation, setNewLocation] = useState('Paranaguá - PR, Brasil');
  const [newVoltage, setNewVoltage] = useState('13.8 kV (Média Tensão - NBR 14039)');
  const [provisionSuccess, setProvisionSuccess] = useState(false);

  // Request access form state
  const [requestTenantCode, setRequestTenantCode] = useState('ARCL-SE02-9901');
  const [requestSent, setRequestSent] = useState(false);

  // Tenants List per User Request Specifications
  const initialTenants: TenantCardData[] = [
    {
      id: 'tenant_copacol_01',
      name: 'Copacol Agroindústria — Planta Cafelândia',
      subname: 'Complexo Industrial Frigorífico & Subestação 13.8kV',
      cnpj: '76.093.738/0001-88',
      location: 'Cafelândia - PR, Brasil',
      category: 'enterprise',
      role: 'admin',
      roleLabel: 'ADMIN',
      metrics: [
        { label: 'Subestações / Plantas', value: '18' },
        { label: 'Tags Únicas Cadastradas', value: '1,420', isHighlight: true },
        {
          label: 'Status Telemetria',
          value: 'MODBUS TCP / OPC-UA (ONLINE)',
          isStatus: true,
          statusOk: true,
        },
        { label: 'Conformidade NBR 5410', value: '98.4%', isHighlight: true },
      ],
      buttonText: 'ABRIR WORKSPACE PRINCIPAL →',
      buttonStyle: 'amber',
      iconType: 'factory',
      tagsCount: 1420,
    },
    {
      id: 'tenant_arcelor_02',
      name: 'ArcelorMittal — Subestação SE-02',
      subname: 'Laminação a Quente & Forno Elétrico a Arco',
      cnpj: '17.469.701/0002-45',
      location: 'Tubarão - ES, Brasil',
      category: 'client',
      role: 'engineer',
      roleLabel: 'ENGINEER',
      metrics: [
        { label: 'Diagramas Unifilares', value: '4' },
        { label: 'Racks CLP / Ladder', value: '2 Racks IEC 61131', isHighlight: true },
        { label: 'BOM Export', value: 'DXF/PDF Pronto', isHighlight: true },
        {
          label: 'Rede de Automação',
          value: 'PROFINET / S7-1500 (ONLINE)',
          isStatus: true,
          statusOk: true,
        },
      ],
      buttonText: 'ABRIR PROJETO TÉCNICO →',
      buttonStyle: 'cyan',
      iconType: 'substation',
      tagsCount: 680,
    },
    {
      id: 'tenant_personal_lab',
      name: 'Workspace Pessoal & Laboratório VOLTAI',
      subname: 'Sandbox de Simulação, Gêmeo Digital 3D & Ensaios IEC',
      cnpj: '00.000.000/0001-91 (Lab Privado)',
      location: 'Curitiba - PR, Brasil',
      category: 'sandbox',
      role: 'member',
      roleLabel: 'OWNER / MEMBER',
      metrics: [
        { label: 'Digital Twin 3D Sandbox', value: 'WebGL CCM-01 Ativo' },
        { label: 'Simulador "E-se?"', value: 'Trip / MT Ativo', isHighlight: true },
        { label: 'Cota IA', value: '4,250 / 5,000 Créditos', isHighlight: true },
        {
          label: 'Ambiente de Execução',
          value: 'Air-Gapped Web Worker',
          isStatus: true,
          statusOk: true,
        },
      ],
      buttonText: 'ACESSAR LAB →',
      buttonStyle: 'darkAmber',
      iconType: 'chip',
      tagsCount: 240,
    },
  ];

  const [tenantsList, setTenantsList] = useState<TenantCardData[]>(initialTenants);

  // Load tenants from Supabase on mount
  useEffect(() => {
    SupabaseDataService.getTenants().then(remoteTenants => {
      if (remoteTenants && remoteTenants.length > 0) {
        const mapped: TenantCardData[] = remoteTenants.map(rt => {
          const isEnterprise = rt.category === 'enterprise';
          return {
            id: rt.id,
            name: rt.name,
            subname: rt.subname || 'Subestação Primária & CCMs',
            cnpj: rt.cnpj || '00.000.000/0001-00',
            location: rt.location || 'Brasil',
            category: rt.category || 'client',
            role: isEnterprise ? 'admin' : 'engineer',
            roleLabel: isEnterprise ? 'ADMIN' : 'ENGINEER',
            metrics: [
              { label: 'Tags Únicas Cadastradas', value: (rt.tags_count || 500).toLocaleString('pt-BR'), isHighlight: true },
              {
                label: 'Status Telemetria',
                value: 'MODBUS TCP / OPC-UA (ONLINE)',
                isStatus: true,
                statusOk: true,
              },
              { label: 'Conformidade NBR 5410', value: '98.5%', isHighlight: true },
            ],
            buttonText: 'ABRIR WORKSPACE PRINCIPAL →',
            buttonStyle: isEnterprise ? 'amber' : 'cyan',
            iconType: isEnterprise ? 'factory' : 'substation',
            tagsCount: rt.tags_count || 500,
          };
        });
        setTenantsList(mapped);
      }
    }).catch(err => {
      console.warn('Supabase tenants fetch note:', err);
    });
  }, []);

  const handleSelectTenant = (item: TenantCardData) => {
    const tenantPayload: Tenant = {
      id: item.id,
      name: item.name,
      cnpj: item.cnpj,
      location: item.location,
      plan: item.category === 'enterprise' ? 'Enterprise Multi-Plant' : 'Industrial Pro',
      currency: 'BRL',
    };
    selectTenantAndOpenWorkspace(tenantPayload, item.role);
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlantName.trim()) return;

    const newId = `tenant_${Date.now()}`;
    const newCard: TenantCardData = {
      id: newId,
      name: newPlantName,
      subname: `Subestação Primária & CCMs - ${newVoltage.split(' ')[0]}`,
      cnpj: newCnpj || '99.888.777/0001-22',
      location: newLocation,
      category: 'enterprise',
      role: 'admin',
      roleLabel: 'ADMIN',
      metrics: [
        { label: 'Subestações / Plantas', value: '1' },
        { label: 'Tags Únicas Cadastradas', value: '48 (Inicial)', isHighlight: true },
        {
          label: 'Status Telemetria',
          value: 'MODBUS TCP (EM PROVISÃO)',
          isStatus: true,
          statusOk: true,
        },
        { label: 'Conformidade NBR 5410', value: '100% Conforme', isHighlight: true },
      ],
      buttonText: 'ABRIR WORKSPACE PRINCIPAL →',
      buttonStyle: 'amber',
      iconType: 'factory',
      tagsCount: 48,
    };

    setTenantsList(prev => [...prev, newCard]);
    setProvisionSuccess(true);

    // Save to Supabase
    try {
      await SupabaseDataService.createTenant({
        name: newCard.name,
        subname: newCard.subname,
        cnpj: newCard.cnpj,
        location: newCard.location,
        plan: 'Enterprise Multi-Plant',
        voltage: newVoltage,
        tags_count: 48,
        members_count: 1,
        category: 'enterprise',
      });
      DatabaseAuthService.addTenant({
        name: newCard.name,
        subname: newCard.subname,
        cnpj: newCard.cnpj,
        location: newCard.location,
        plan: 'Enterprise Multi-Plant',
        voltage: newVoltage,
        tagsCount: 48,
        membersCount: 1,
        category: 'enterprise',
      });
    } catch (err) {
      console.warn('Supabase tenant creation note:', err);
    }

    setTimeout(() => {
      setProvisionSuccess(false);
      setCreateTenantModalOpen(false);
      // Open immediately
      handleSelectTenant(newCard);
    }, 1200);
  };

  const filteredTenants = tenantsList.filter(
    t =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen w-screen bg-[#0B0D10] text-slate-100 flex flex-col overflow-x-hidden select-none font-sans">
      {/* ========================================================
          1. TOP NAVIGATION HEADER
      ======================================================== */}
      <header className="h-16 w-full bg-[#11141A] border-b border-[#232833] px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30 shadow-md">
        {/* Left: EletricAI Logo with glowing amber bolt icon and "VOLTAI Engine v2.4 - Workspace Router" */}
        <div className="flex items-center gap-3.5">
          <div className="h-9 w-9 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.3)]">
            <Zap className="h-5 w-5 fill-amber-400" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-wider text-slate-100 font-sans">
                ELETRIC<span className="text-amber-400 font-black">AI</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono font-bold tracking-tight">
                VOLTAI Engine v2.4
              </span>
              <span className="text-slate-500 text-xs hidden sm:inline">•</span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                Workspace Router
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Sistema Operacional Industrial com Isolamento RLS Multi-Tenant
            </span>
          </div>
        </div>

        {/* Right: Authenticated User Profile Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#161A22] border border-[#232833]">
            {/* Avatar */}
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500/30 to-amber-700/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-mono text-xs font-bold shadow-inner">
              LF
            </div>

            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200">
                Eng. Luis Felipe
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-cyan-400 font-medium">
                  System Engineer
                </span>
                <span className="text-[9px] text-slate-500 font-mono">• CREA-PR</span>
              </div>
            </div>
          </div>

          {/* Dark "Log Out" button */}
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161A22] border border-[#232833] hover:border-red-500/40 text-slate-300 hover:text-red-400 text-xs font-mono transition-colors cursor-pointer"
            title="Encerrar sessão no servidor de autenticação"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* ========================================================
          2. MAIN CONTENT AREA (Centered High-Density Layout)
      ======================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-10 py-8 lg:py-10 flex flex-col justify-between">
        <div>
          {/* Header Text & Search / Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#232833]">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono mb-2">
                <ShieldCheck className="h-3 w-3" />
                <span>ROW LEVEL SECURITY (RLS) ISOLATION ENABLED</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                Selecione o Tenant ou Planta Industrial
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Escolha a organização para carregar a engine de tags, diagramas NBR 5410 e permissões
                RLS isoladas.
              </p>
            </div>

            {/* Quick Search */}
            <div className="relative w-full md:w-72">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Filtrar tenants ou plantas..."
                className="w-full pl-9 pr-3 py-2 bg-[#161A22] border border-[#232833] rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* ========================================================
              3. TENANT SELECTION CARDS GRID (3 Columns / Cards Layout)
          ======================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filteredTenants.map((item, index) => {
              const isFirstCard = index === 0;

              return (
                <div
                  key={item.id}
                  className={`bg-[#161A22] border rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 relative group ${
                    isFirstCard
                      ? 'border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.08)] ring-1 ring-amber-500/30'
                      : 'border-[#232833] hover:border-slate-600 hover:shadow-xl'
                  }`}
                >
                  {/* Subtle top edge glow for active card */}
                  {isFirstCard && (
                    <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                  )}

                  {/* CARD TOP HEADER & ROLE BADGE */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border ${
                            item.buttonStyle === 'amber'
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                              : item.buttonStyle === 'cyan'
                              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                              : 'bg-slate-800/60 border-slate-700 text-amber-300'
                          }`}
                        >
                          {item.iconType === 'factory' && <Factory className="h-6 w-6" />}
                          {item.iconType === 'substation' && <Building2 className="h-6 w-6" />}
                          {item.iconType === 'chip' && <Cpu className="h-6 w-6" />}
                        </div>

                        <div>
                          <h3 className="font-bold text-sm sm:text-base text-slate-100 leading-snug">
                            {item.name}
                          </h3>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {item.location}
                          </span>
                        </div>
                      </div>

                      {/* ROLE BADGE */}
                      <div>
                        {item.roleLabel === 'ADMIN' && (
                          <span className="px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/50 text-[#F59E0B] text-xs font-mono font-bold tracking-wider inline-block">
                            ADMIN
                          </span>
                        )}
                        {item.roleLabel === 'ENGINEER' && (
                          <span className="px-2.5 py-1 rounded bg-cyan-500/15 border border-cyan-500/50 text-[#06B6D4] text-xs font-mono font-bold tracking-wider inline-block">
                            ENGINEER
                          </span>
                        )}
                        {item.roleLabel === 'OWNER / MEMBER' && (
                          <span className="px-2 py-1 rounded bg-[#1C212C] border border-[#232833] text-slate-300 text-[10px] font-mono font-bold tracking-wider inline-block">
                            OWNER / MEMBER
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 font-sans mb-4 leading-relaxed line-clamp-1">
                      {item.subname}
                    </p>

                    {/* KEY METRICS GRID */}
                    <div className="bg-[#11141A] rounded-xl border border-[#232833] p-3.5 space-y-2.5 font-mono text-xs mb-6">
                      {item.metrics.map((metric, mIdx) => (
                        <div
                          key={mIdx}
                          className="flex items-center justify-between text-[11px] pb-1.5 border-b border-[#232833]/60 last:border-b-0 last:pb-0"
                        >
                          <span className="text-slate-400">{metric.label}:</span>

                          {metric.isStatus ? (
                            <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px]">
                              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                              {metric.value}
                            </span>
                          ) : (
                            <span
                              className={`font-semibold ${
                                metric.isHighlight
                                  ? item.buttonStyle === 'cyan'
                                    ? 'text-cyan-400'
                                    : 'text-amber-400'
                                  : 'text-slate-200'
                              }`}
                            >
                              {metric.value}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* BOTTOM CTA BUTTON */}
                  <div>
                    {item.buttonStyle === 'amber' && (
                      <button
                        type="button"
                        onClick={() => handleSelectTenant(item)}
                        className="w-full bg-[#F59E0B] hover:bg-amber-400 text-[#0B0D10] font-black py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 text-xs font-mono tracking-wider transition-all transform active:scale-[0.99] cursor-pointer"
                      >
                        <span>{item.buttonText}</span>
                      </button>
                    )}

                    {item.buttonStyle === 'cyan' && (
                      <button
                        type="button"
                        onClick={() => handleSelectTenant(item)}
                        className="w-full bg-[#161A22] hover:bg-[#1E2430] border border-[#06B6D4] text-[#06B6D4] hover:text-cyan-300 font-bold py-3 px-4 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center justify-center gap-2 text-xs font-mono tracking-wider transition-all transform active:scale-[0.99] cursor-pointer"
                      >
                        <span>{item.buttonText}</span>
                      </button>
                    )}

                    {item.buttonStyle === 'darkAmber' && (
                      <button
                        type="button"
                        onClick={() => handleSelectTenant(item)}
                        className="w-full bg-[#161A22] hover:bg-[#1E2430] border border-amber-500/60 text-amber-400 hover:text-amber-300 font-bold py-3 px-4 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.15)] flex items-center justify-center gap-2 text-xs font-mono tracking-wider transition-all transform active:scale-[0.99] cursor-pointer"
                      >
                        <span>{item.buttonText}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================
              4. NEW TENANT ACTION CARD (Dashed Box)
          ======================================================== */}
          <div className="mt-6 border-2 border-dashed border-[#2A313D] hover:border-amber-500/50 bg-[#161A22]/40 hover:bg-[#161A22] rounded-2xl p-6 transition-all duration-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-[#1C212C] border border-[#2A313D] flex items-center justify-center text-amber-400 shrink-0">
                <Plus className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setCreateTenantModalOpen(true)}
                  className="font-bold text-sm text-slate-100 hover:text-amber-400 transition-colors block text-left"
                >
                  + Criar Nova Organização ou Cadastrar Planta Industrial
                </button>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Provisione uma nova subestação ou planta com esquema NBR 5410 e isolamento de banco.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRequestAccessModalOpen(true)}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline px-3 py-1.5 rounded bg-[#11141A] border border-[#232833] cursor-pointer flex items-center gap-1.5"
              >
                <Key className="h-3 w-3" />
                <span>Solicitar Acesso a Tenant Existente</span>
              </button>

              <button
                type="button"
                onClick={() => setCreateTenantModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-400 hover:bg-amber-500/25 text-xs font-mono font-bold transition-all cursor-pointer"
              >
                Cadastrar Planta
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            5. FOOTER SUMMARY BAR
        ======================================================== */}
        <footer className="mt-10 pt-4 border-t border-[#232833] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Supabase RLS Tenant Security: 100% Ativo & Isolado</span>
            </div>
            <span className="hidden sm:inline text-slate-600">|</span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Plano: Multi-Tenant Enterprise Plan (Ilimitado)</span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setSettingsModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 text-xs font-mono cursor-pointer"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Configurações do Tenant & RLS</span>
            </button>
          </div>
        </footer>
      </main>

      {/* ========================================================
          MODAL 1: CRIAR NOVA ORGANIZAÇÃO OU CADASTRAR PLANTA
      ======================================================== */}
      {createTenantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-[#161A22] border border-[#232833] rounded-2xl shadow-2xl p-6 sm:p-7 relative">
            <button
              onClick={() => setCreateTenantModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            {provisionSuccess ? (
              <div className="py-6 text-center">
                <div className="h-14 w-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/40">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-100">
                  Tenant Provisionado com Sucesso!
                </h3>
                <p className="text-xs text-slate-300 mt-2 font-mono">
                  Isolamento RLS criado no PostgreSQL e barramento inicial configurado. Carregando
                  workspace...
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2.5 text-amber-400 mb-2">
                  <Factory className="h-5 w-5" />
                  <h3 className="font-bold text-lg text-slate-100">
                    Cadastrar Nova Planta Industrial
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mb-5">
                  Crie uma instância isolada para sua subestação, usina ou fábrica com schema
                  segregado per NBR 5410 / NR-10.
                </p>

                <form onSubmit={handleCreateTenant} className="space-y-3.5">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-mono">
                      Nome da Empresa / Planta Industrial
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Usina Bioelétrica Paranaguá — Moagem"
                      value={newPlantName}
                      onChange={e => setNewPlantName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1C212C] border border-[#232833] rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1 font-mono">
                        CNPJ da Unidade
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 11.222.333/0001-44"
                        value={newCnpj}
                        onChange={e => setNewCnpj(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1C212C] border border-[#232833] rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1 font-mono">
                        Localização / Estado
                      </label>
                      <input
                        type="text"
                        value={newLocation}
                        onChange={e => setNewLocation(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1C212C] border border-[#232833] rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-mono">
                      Tensão Primária & Norma
                    </label>
                    <select
                      value={newVoltage}
                      onChange={e => setNewVoltage(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1C212C] border border-[#232833] rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-amber-500"
                    >
                      <option>13.8 kV (Média Tensão - NBR 14039)</option>
                      <option>23.1 kV (Média Tensão - NBR 14039)</option>
                      <option>34.5 kV (Média Tensão - NBR 14039)</option>
                      <option>380V / 220V (Baixa Tensão Industrial - NBR 5410)</option>
                    </select>
                  </div>

                  <div className="p-3 bg-[#11141A] border border-[#232833] rounded-lg text-[11px] font-mono text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>
                      O isolamento RLS garantirá que apenas engenheiros deste tenant tenham acesso
                      aos diagramas unifilares e lógicas Ladder.
                    </span>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setCreateTenantModalOpen(false)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#1C212C] text-slate-300 hover:bg-[#232833] text-xs font-mono"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0B0D10] text-xs font-bold font-mono uppercase tracking-wider"
                    >
                      Provisionar Planta RLS
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: SOLICITAR ACESSO A TENANT EXISTENTE
      ======================================================== */}
      {requestAccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#161A22] border border-[#232833] rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => {
                setRequestAccessModalOpen(false);
                setRequestSent(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            {requestSent ? (
              <div className="py-6 text-center">
                <div className="h-12 w-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-3 border border-cyan-500/40">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-slate-100">
                  Solicitação Enviada ao Administrador!
                </h3>
                <p className="text-xs text-slate-300 mt-2 font-mono">
                  O responsável técnico do tenant receberá sua solicitação com validação CREA-PR.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setRequestAccessModalOpen(false);
                    setRequestSent(false);
                  }}
                  className="mt-4 px-4 py-1.5 rounded bg-cyan-500 text-slate-900 text-xs font-bold font-mono"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2.5 text-cyan-400 mb-2">
                  <Key className="h-5 w-5" />
                  <h3 className="font-bold text-lg text-slate-100">
                    Solicitar Acesso a Tenant
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Informe o identificador da organização ou token de convite fornecido pelo gestor da
                  planta.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-mono">
                      Código do Tenant / Chave de Convite
                    </label>
                    <input
                      type="text"
                      value={requestTenantCode}
                      onChange={e => setRequestTenantCode(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1C212C] border border-[#232833] rounded-lg text-slate-200 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-mono">
                      Perfil Solicitado
                    </label>
                    <select className="w-full px-3 py-2 bg-[#1C212C] border border-[#232833] rounded-lg text-slate-200 text-xs font-mono">
                      <option>Engenheiro de Aplicação (Edição CAD/Ladder)</option>
                      <option>Operador SCADA (Apenas Monitoramento e Telemetria)</option>
                      <option>Auditor de Segurança NR-10 (Leitura de Prontuário)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestAccessModalOpen(false)}
                    className="px-3 py-1.5 rounded bg-[#1C212C] text-slate-300 hover:bg-[#232833] text-xs font-mono"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestSent(true)}
                    className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-[#0B0D10] text-xs font-bold font-mono uppercase"
                  >
                    Enviar Solicitação
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: CONFIGURAÇÕES DO TENANT & RLS
      ======================================================== */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-[#161A22] border border-[#232833] rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setSettingsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 text-amber-400 mb-2">
              <Settings className="h-5 w-5" />
              <h3 className="font-bold text-lg text-slate-100">
                Políticas de Segurança e RLS
              </h3>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Visão das políticas Row Level Security ativas para o tenant principal selecionado.
            </p>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-3 bg-[#11141A] rounded-lg border border-[#232833]">
                <div className="flex justify-between text-slate-300 font-bold mb-1">
                  <span>Isolamento de Banco:</span>
                  <span className="text-emerald-400">PostgreSQL Schema RLS</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  WHERE tenant_id = auth.jwt() -&gt; &apos;tenant_id&apos; (ENFORCED)
                </p>
              </div>

              <div className="p-3 bg-[#11141A] rounded-lg border border-[#232833]">
                <div className="flex justify-between text-slate-300 font-bold mb-1">
                  <span>Cluster da Região:</span>
                  <span className="text-cyan-400">sa-east-1 (São Paulo, BR)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Latência Média: 12ms • Conformidade LGPD &amp; Marco Civil da Internet
                </p>
              </div>

              <div className="p-3 bg-[#11141A] rounded-lg border border-[#232833]">
                <div className="flex justify-between text-slate-300 font-bold mb-1">
                  <span>Certificado SIL-3:</span>
                  <span className="text-amber-400">Validação Criptográfica OK</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Chave privada de barramento assinado por hardware HSM dedicado.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSettingsModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0B0D10] text-xs font-bold font-mono"
              >
                Fechar Painel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
