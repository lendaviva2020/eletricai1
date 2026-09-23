'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import { useSettings } from '@/components/shared/SettingsContext';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Tv,
  Network,
  Binary,
  FileSpreadsheet,
  Download,
  Check,
  X,
  ChevronRight,
  Server,
  Activity,
  HardDrive,
  ExternalLink,
  Code2,
  Lock,
  Settings,
} from 'lucide-react';

export function LandingPage() {
  const { openWorkspaceFromLanding, openLoginFromLanding } = useWorkspace();
  const { openSettings } = useSettings();

  // Contact / Enterprise Demo Modal
  const [enterpriseModalOpen, setEnterpriseModalOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    plantType: 'Usina / Indústria Química',
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setEnterpriseModalOpen(false);
      setContactForm({
        name: '',
        email: '',
        company: '',
        plantType: 'Usina / Indústria Química',
      });
    }, 2200);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0D10] text-[#8A8F98] font-sans antialiased selection:bg-amber-500/20 selection:text-amber-200">
      {/* ========================================================
          1. HEADER (NAVEGAÇÃO SUPERIOR MINIMALISTA)
      ======================================================== */}
      <header className="sticky top-0 z-50 w-full bg-[#0B0D10]/90 backdrop-blur-md border-b border-[#232833]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Esquerda: Logo textual VOLTAI com indicador discreto */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="h-7 w-7 rounded bg-[#161A22] border border-[#232833] flex items-center justify-center text-amber-400 group-hover:border-amber-500/40 transition-colors">
                <Zap className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-base tracking-wider text-white">
                  VOLTAI
                </span>
                <span className="text-[10px] font-mono text-[#8A8F98] px-1.5 py-0.5 rounded bg-[#161A22] border border-[#232833]">
                  EletricAI Engine
                </span>
              </div>
            </button>
          </div>

          {/* Centro: Links de navegação suave */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#8A8F98]">
            <button
              onClick={() => scrollToSection('shared-engine')}
              className="hover:text-white transition-colors"
            >
              Shared Engine
            </button>
            <button
              onClick={() => scrollToSection('modulos')}
              className="hover:text-white transition-colors"
            >
              Módulos
            </button>
            <button
              onClick={() => scrollToSection('normas')}
              className="hover:text-white transition-colors"
            >
              Normas ABNT
            </button>
            <button
              onClick={() => scrollToSection('comparativo')}
              className="hover:text-white transition-colors"
            >
              Comparativo
            </button>
            <button
              onClick={() => scrollToSection('planos')}
              className="hover:text-white transition-colors"
            >
              Planos
            </button>
          </nav>

          {/* Direita: Ações */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => openSettings()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 bg-[#161A22] border border-[#232833] hover:border-amber-500/50 transition-colors group"
              title="Configurações do Sistema e Normas ABNT"
            >
              <Settings className="h-4 w-4 group-hover:rotate-45 transition-transform duration-200" />
            </button>

            <button
              onClick={openLoginFromLanding}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-[#161A22] border border-[#232833] hover:border-slate-700 transition-colors"
            >
              Entrar
            </button>

            <button
              onClick={openWorkspaceFromLanding}
              className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-tight text-[#0B0D10] bg-[#F59E0B] hover:bg-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Abrir Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================
          2. HERO SECTION (PROPOSTA DE VALOR DIRETA)
      ======================================================== */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-[#232833]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Badge Superior Discreto */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161A22] border border-[#232833] text-xs font-mono text-[#8A8F98] mb-6">
            <span className="h-2 w-2 rounded-full bg-[#10B981]" />
            <span>VOLTAI Workspace • Validação NBR 5410 em tempo real</span>
          </div>

          {/* Título Principal (H1) - Sem gradiente multicolorido */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl leading-[1.12]">
            Projete esquemas elétricos e automação. <br className="hidden sm:inline" />
            <span className="text-[#8A8F98]">Sem re-digitar uma única tag.</span>
          </h1>

          {/* Subtítulo sóbrio */}
          <p className="mt-6 text-base sm:text-lg text-[#8A8F98] max-w-2xl font-normal leading-relaxed">
            O VOLTAI integra o CAD Unifilar, a lógica Ladder IEC 61131-3 e o mímico SCADA em uma
            única engine de dados industrial.
          </p>

          {/* Ações primárias */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
            <button
              onClick={openWorkspaceFromLanding}
              className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-mono font-bold text-[#0B0D10] bg-[#F59E0B] hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>Abrir Workspace no Browser</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => scrollToSection('shared-engine')}
              className="w-full sm:w-auto px-5 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-[#161A22] border border-[#232833] hover:border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <span>Conhecer a Shared Engine</span>
            </button>
          </div>

          {/* Mockup Visual do Workspace - Alta densidade industrial */}
          <div className="mt-14 w-full rounded-xl border border-[#232833] bg-[#161A22] p-2 sm:p-3 shadow-2xl text-left">
            {/* Mockup Window Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#232833] bg-[#11141A] rounded-t-lg">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#232833]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#232833]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#232833]" />
                </div>
                <span className="text-[11px] font-mono text-[#8A8F98] ml-2">
                  VOLTAI IDE • Subestacao_SE01_Principal.eai
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span className="text-[#10B981] flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                  NBR 5410 VÁLIDO
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-[#06B6D4]">S7-1500 ON</span>
              </div>
            </div>

            {/* Split View: Unifilar + Ladder conectados pela Shared Tag */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 p-2 sm:p-3 bg-[#0B0D10] rounded-b-lg">
              {/* Lado Esquerdo: Diagrama Unifilar */}
              <div className="p-3.5 rounded-lg bg-[#11141A] border border-[#232833] font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#232833] mb-3">
                  <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1.5">
                    <Network className="h-3.5 w-3.5" />
                    CAD UNIFILAR • CCM-01 (380V)
                  </span>
                  <span className="text-[10px] text-[#8A8F98]">Queda: 1.4% (Max 4.0%)</span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-2 rounded bg-[#161A22] border border-[#232833] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#8A8F98] block">Alimentador MT</span>
                      <span className="text-white font-bold">Entrada Primária 13.8 kV</span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold">TRAFO 500 kVA</span>
                  </div>

                  <div className="p-2 rounded bg-[#161A22] border border-amber-500/40 relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 font-bold">
                            TAG
                          </span>
                          <span className="text-white font-bold">Q02_COMPRESSOR</span>
                        </div>
                        <span className="text-[11px] text-[#8A8F98] mt-0.5 block">
                          Motor 75kW • 142A • Disjuntor-Motor WEG
                        </span>
                      </div>
                      <span className="text-[10px] text-[#10B981] font-bold">FECHADO (ON)</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-[#8A8F98] flex items-center justify-between pt-1">
                    <span>Condutor: 3x95+50mm² EPR 90°C</span>
                    <span>Icc Barramento: 35 kA</span>
                  </div>
                </div>
              </div>

              {/* Lado Direito: Editor Ladder IEC 61131-3 */}
              <div className="p-3.5 rounded-lg bg-[#11141A] border border-[#232833] font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#232833] mb-3">
                  <span className="text-[11px] text-[#06B6D4] font-bold flex items-center gap-1.5">
                    <Binary className="h-3.5 w-3.5" />
                    LADDER IEC 61131-3 • RUNG 01
                  </span>
                  <span className="text-[10px] text-[#8A8F98]">Ciclo CLP: 2.1 ms</span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-2.5 rounded bg-[#161A22] border border-[#232833] text-[11px]">
                    <div className="text-[10px] text-[#8A8F98] mb-1 font-mono">
                      {"// Lógica de Intertravamento e Partida"}
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      <span className="text-[#10B981]">|---[ %I0.0 ]---</span>
                      <span className="text-[#06B6D4]">---[ %I0.1 ]---</span>
                      <span className="text-amber-400 font-bold">---( %Q0.2 )---|</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#8A8F98] mt-2 pt-1.5 border-t border-[#232833]">
                      <span>%I0.0: EMERGENCIA_OK</span>
                      <span className="text-amber-400 font-bold">%Q0.2: Q02_COMPRESSOR</span>
                    </div>
                  </div>

                  {/* Sincronização central visível */}
                  <div className="p-2 rounded bg-[#161A22] border border-[#232833] flex items-center justify-between text-[10px]">
                    <span className="text-[#06B6D4] font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Shared Tag Sincronizada
                    </span>
                    <span className="text-[#8A8F98]">Propagado para SCADA & BOM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. BARRA DE CONFORMIDADE NORMATIVA (ABNT & IEC)
      ======================================================== */}
      <section id="normas" className="py-8 bg-[#11141A] border-b border-[#232833]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#161A22] border border-[#232833]">
              <ShieldCheck className="h-4 w-4 text-[#10B981] shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">NBR 5410</span>
                <span className="text-[10px] text-[#8A8F98]">Baixa Tensão</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#161A22] border border-[#232833]">
              <ShieldCheck className="h-4 w-4 text-[#06B6D4] shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">NBR 14039</span>
                <span className="text-[10px] text-[#8A8F98]">Média Tensão MT</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#161A22] border border-[#232833]">
              <ShieldCheck className="h-4 w-4 text-[#10B981] shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">NR-10</span>
                <span className="text-[10px] text-[#8A8F98]">Segurança Elétrica</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#161A22] border border-[#232833]">
              <Cpu className="h-4 w-4 text-purple-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">IEC 61131-3</span>
                <span className="text-[10px] text-[#8A8F98]">Ladder / FBD / ST</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#161A22] border border-[#232833] col-span-2 md:col-span-1">
              <Download className="h-4 w-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">PLCopen & DXF</span>
                <span className="text-[10px] text-[#8A8F98]">Exportação Padrão</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. SEÇÃO "SHARED TAG ENGINE" (O DIFERENCIAL DO PRODUTO)
      ======================================================== */}
      <section id="shared-engine" className="py-20 border-b border-[#232833]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold block mb-2">
              Arquitetura Central
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Uma única tag para CAD, CLP, SCADA e Lista de Materiais.
            </h2>
            <p className="mt-3 text-sm text-[#8A8F98] leading-relaxed">
              Em ferramentas tradicionais, o projetista elétrico desenha o disjuntor e o programador
              de automação precisa redigitar tudo na IDE do fabricante. No VOLTAI, criar uma tag no
              diagrama atualiza todos os subsistemas em milissegundos.
            </p>
          </div>

          {/* Card central explicativo com grid de propagação */}
          <div className="rounded-xl bg-[#161A22] border border-[#232833] p-6 lg:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#232833]">
              <div>
                <span className="text-xs font-mono text-[#8A8F98] block">Alimentador Criado no CAD:</span>
                <span className="text-lg font-mono font-bold text-white mt-0.5 block">
                  TAG: <span className="text-amber-400">Q02_COMPRESSOR</span> (75 kW / 380V)
                </span>
              </div>
              <div className="px-3 py-1.5 rounded bg-[#11141A] border border-[#232833] font-mono text-xs text-[#10B981] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Propagação Determinística Imediata</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Propagação 1: CLP */}
              <div className="p-4 rounded-lg bg-[#11141A] border border-[#232833] space-y-2 font-mono text-xs">
                <div className="flex items-center gap-2 text-[#06B6D4] font-bold text-xs">
                  <Binary className="h-4 w-4" />
                  <span>1. Lógica Ladder / CLP</span>
                </div>
                <p className="text-[#8A8F98] text-[11px] font-sans">
                  Associação automática do endereço <strong className="text-white font-mono">%Q0.2</strong>{' '}
                  no Rack Siemens S7-1500 ou Rockwell ControlLogix.
                </p>
                <div className="p-2 rounded bg-[#161A22] border border-[#232833] text-[10px] text-slate-300">
                  Symbol: <code>Q02_COMPRESSOR</code> <br />
                  Data Type: <code>BOOL</code>
                </div>
              </div>

              {/* Propagação 2: SCADA */}
              <div className="p-4 rounded-lg bg-[#11141A] border border-[#232833] space-y-2 font-mono text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Tv className="h-4 w-4" />
                  <span>2. Mímico SCADA & Telemetria</span>
                </div>
                <p className="text-[#8A8F98] text-[11px] font-sans">
                  Widget de bomba/compressor vinculado automaticamente para leitura de status,
                  corrente RMS (142 A) e sinal de trip térmico.
                </p>
                <div className="p-2 rounded bg-[#161A22] border border-[#232833] text-[10px] text-slate-300">
                  Modbus Reg: <code>40012 (Status)</code> <br />
                  Worker Sandbox: <code>Isolado</code>
                </div>
              </div>

              {/* Propagação 3: BOM */}
              <div className="p-4 rounded-lg bg-[#11141A] border border-[#232833] space-y-2 font-mono text-xs">
                <div className="flex items-center gap-2 text-[#10B981] font-bold text-xs">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>3. Lista de Materiais (BOM)</span>
                </div>
                <p className="text-[#8A8F98] text-[11px] font-sans">
                  Inserção automática do disjuntor-motor WEG MPW80, contator 160A e condutor
                  3x95+50mm² no memorial de cálculo NBR 5410.
                </p>
                <div className="p-2 rounded bg-[#161A22] border border-[#232833] text-[10px] text-slate-300">
                  Código: <code>WEG-10154820</code> <br />
                  Item NBR: <code>6.3.4.2 (Ampacidade)</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. GRID DE MÓDULOS (4 CARDS DE FUNCIONALIDADES)
      ======================================================== */}
      <section id="modulos" className="py-20 bg-[#11141A] border-b border-[#232833]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold block mb-2">
              Engenharia Completa
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Módulos construídos para fluxos industriais reais.
            </h2>
            <p className="mt-3 text-sm text-[#8A8F98] leading-relaxed">
              Projetado para eliminar ferramentas dispersas e cálculos em cadernos de rascunho.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: CAD Unifilar & MT/BT */}
            <div className="p-6 rounded-xl bg-[#161A22] border border-[#232833] space-y-3">
              <div className="h-10 w-10 rounded-lg bg-[#11141A] border border-[#232833] flex items-center justify-center text-amber-400">
                <Network className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">CAD Unifilar & MT/BT</h3>
              <p className="text-xs text-[#8A8F98] leading-relaxed font-normal">
                Cálculo de fluxo de carga, dimensionamento de condutores por ampacidade e queda de
                tensão segundo a NBR 5410. Suporte a barramentos de cobre de até 4000A e nível de
                curto-circuito Icc de 36kA.
              </p>
              <div className="pt-2 font-mono text-[11px] text-amber-400 flex items-center gap-1.5">
                <span>Verificação ABNT em tempo de projeto</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Card 2: Editor Ladder IEC 61131-3 */}
            <div className="p-6 rounded-xl bg-[#161A22] border border-[#232833] space-y-3">
              <div className="h-10 w-10 rounded-lg bg-[#11141A] border border-[#232833] flex items-center justify-center text-[#06B6D4]">
                <Binary className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Editor Ladder IEC 61131-3</h3>
              <p className="text-xs text-[#8A8F98] leading-relaxed font-normal">
                IDE completa com suporte a rungs, blocos FBD, temporizadores TON/TOF e bobinas.
                Configurador de racks para CLP com exportação PLCopen XML nativa para integração com
                Siemens TIA Portal e Rockwell Studio 5000.
              </p>
              <div className="pt-2 font-mono text-[11px] text-[#06B6D4] flex items-center gap-1.5">
                <span>Padrão universal PLCopen XML</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Card 3: IA Copilot Auditável */}
            <div className="p-6 rounded-xl bg-[#161A22] border border-[#232833] space-y-3">
              <div className="h-10 w-10 rounded-lg bg-[#11141A] border border-[#232833] flex items-center justify-center text-[#10B981]">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">IA Copilot Auditável</h3>
              <p className="text-xs text-[#8A8F98] leading-relaxed font-normal">
                Sugestões técnicas apresentadas como Patch Diff visual (linhas verdes de adição e
                vermelhas de remoção). Exige aprovação explícita do engenheiro responsável,
                garantindo 100% de rastreabilidade para emissão de ART.
              </p>
              <div className="pt-2 font-mono text-[11px] text-[#10B981] flex items-center gap-1.5">
                <span>Sem alucinações em projetos críticos</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Card 4: Supervisório SCADA Cloud */}
            <div className="p-6 rounded-xl bg-[#161A22] border border-[#232833] space-y-3">
              <div className="h-10 w-10 rounded-lg bg-[#11141A] border border-[#232833] flex items-center justify-center text-purple-400">
                <Tv className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Supervisório SCADA Cloud</h3>
              <p className="text-xs text-[#8A8F98] leading-relaxed font-normal">
                Telas mímicas operacionais com telemetria RMS em tempo real, monitoramento de grandezas
                elétricas e execução de scripts em Web Workers isolados (Air-Gapped Sandbox),
                garantindo proteção contra paradas no chão de fábrica.
              </p>
              <div className="pt-2 font-mono text-[11px] text-purple-400 flex items-center gap-1.5">
                <span>Sandbox de script sem risco de crash</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. TABELA COMPARATIVA TÉCNICA (TRADICIONAIS VS VOLTAI)
      ======================================================== */}
      <section id="comparativo" className="py-20 border-b border-[#232833]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold block mb-2">
              Comparativo Técnico
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              A evolução necessária frente a ferramentas legadas.
            </h2>
            <p className="mt-3 text-sm text-[#8A8F98] leading-relaxed">
              Compare as abordagens de desenvolvimento entre softwares legados de desenho e o VOLTAI.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#232833] bg-[#161A22]">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#11141A] border-b border-[#232833] text-[11px] font-mono text-[#8A8F98]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Critério de Engenharia</th>
                  <th className="py-3.5 px-4 font-semibold text-slate-400">Softwares Legados (CAD / Desktop)</th>
                  <th className="py-3.5 px-4 font-semibold text-amber-400 bg-amber-500/5">
                    VOLTAI Industrial OS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232833] text-[#8A8F98]">
                <tr>
                  <td className="py-3.5 px-4 font-medium text-white">Instalação e Requisitos</td>
                  <td className="py-3.5 px-4">Instaladores pesados de 15GB, apenas Windows, dongle físico.</td>
                  <td className="py-3.5 px-4 text-white font-medium bg-amber-500/5">
                    Web nativo, zero instalação, multi-SO e acesso imediato.
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-medium text-white">Sincronização de Tags</td>
                  <td className="py-3.5 px-4">Planilhas Excel paralelas, redigitação manual e risco de erro.</td>
                  <td className="py-3.5 px-4 text-[#10B981] font-medium bg-amber-500/5">
                    Shared Tag Engine unificada e bidirecional (CAD ⇄ Ladder ⇄ SCADA).
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-medium text-white">Validação Normativa ABNT</td>
                  <td className="py-3.5 px-4">Conferência manual em tabelas de ampacidade impressas.</td>
                  <td className="py-3.5 px-4 text-white font-medium bg-amber-500/5">
                    Auditoria contínua NBR 5410, NBR 14039 e NR-10 em tempo real.
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-medium text-white">Padrão de Automação</td>
                  <td className="py-3.5 px-4">Formatos proprietários fechados por fabricante.</td>
                  <td className="py-3.5 px-4 text-[#06B6D4] font-medium bg-amber-500/5">
                    IEC 61131-3 universal e exportação PLCopen XML compatível.
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-medium text-white">Auditoria com IA</td>
                  <td className="py-3.5 px-4">Inexistente ou chatbots genéricos sem contexto técnico.</td>
                  <td className="py-3.5 px-4 text-white font-medium bg-amber-500/5">
                    IA determinística com Patch Diff visual e aprovação manual.
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 font-medium text-white">Multi-tenant e Segurança</td>
                  <td className="py-3.5 px-4">Arquivos soltos em pastas locais sem controle de acesso.</td>
                  <td className="py-3.5 px-4 text-white font-medium bg-amber-500/5">
                    PostgreSQL com Row Level Security (RLS) e isolamento por planta.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. PRICING (3 PLANOS SAAS)
      ======================================================== */}
      <section id="planos" className="py-20 bg-[#11141A] border-b border-[#232833]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12 text-center mx-auto">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold block mb-2">
              Planos e Assinatura
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Preços transparentes para engenharia industrial.
            </h2>
            <p className="mt-3 text-sm text-[#8A8F98] leading-relaxed">
              Sem taxas ocultas. Escolha o plano adequado para a sua demanda técnica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Plano 1: Estudante */}
            <div className="p-6 rounded-xl bg-[#161A22] border border-[#232833] flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-[#8A8F98] block">Para Acadêmicos & SENAI</span>
                <h3 className="text-lg font-bold text-white mt-1">Estudante</h3>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-bold text-white font-mono">R$ 0</span>
                  <span className="text-xs text-[#8A8F98] font-mono"> / mês</span>
                </div>

                <ul className="space-y-2.5 text-xs text-[#8A8F98] mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Até 2 projetos de estudo ativos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Validação básica NBR 5410</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Simulador Ladder com até 10 rungs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span>Exportação com marca d&apos;água educacional</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={openWorkspaceFromLanding}
                className="w-full py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-[#11141A] border border-[#232833] hover:border-slate-600 transition-colors"
              >
                Começar Grátis
              </button>
            </div>

            {/* Plano 2: Engenheiro Pro (Destacado) */}
            <div className="p-6 rounded-xl bg-[#161A22] border border-amber-500/50 flex flex-col justify-between relative shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-[#0B0D10] text-[10px] font-mono font-bold tracking-wider uppercase">
                Mais Escolhido
              </div>

              <div>
                <span className="text-xs font-mono text-amber-400 block">Profissionais & Projetistas</span>
                <h3 className="text-lg font-bold text-white mt-1">Engenheiro Pro</h3>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-bold text-white font-mono">R$ 289</span>
                  <span className="text-xs text-[#8A8F98] font-mono"> / mês</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Projetos e diagramas ilimitados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Shared Tag Engine completa (sem limite de I/O)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Cálculos NBR 5410, NBR 14039 e NR-10</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Exportação DXF, PLCopen XML e Memorial Excel</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>IA Copilot Auditável com 5.000 créditos</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={openWorkspaceFromLanding}
                className="w-full py-2.5 rounded-lg text-xs font-mono font-bold text-[#0B0D10] bg-[#F59E0B] hover:bg-amber-400 transition-colors"
              >
                Abrir Workspace Pro
              </button>
            </div>

            {/* Plano 3: Enterprise */}
            <div className="p-6 rounded-xl bg-[#161A22] border border-[#232833] flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-[#8A8F98] block">Indústrias & Usinas</span>
                <h3 className="text-lg font-bold text-white mt-1">Enterprise</h3>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-bold text-white font-mono">Sob Consulta</span>
                  <span className="text-xs text-[#8A8F98] font-mono"> / sob medida</span>
                </div>

                <ul className="space-y-2.5 text-xs text-[#8A8F98] mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#06B6D4] shrink-0" />
                    <span>Multi-tenant com isolamento RLS (Supabase)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#06B6D4] shrink-0" />
                    <span>Conexão direta com gateways Modbus TCP / OPC-UA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#06B6D4] shrink-0" />
                    <span>SSO corporativo (SAML / Okta / Azure AD)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#06B6D4] shrink-0" />
                    <span>SLA de disponibilidade 99.9% e suporte 24/7</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#06B6D4] shrink-0" />
                    <span>Treinamento in-company para equipes técnicas</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setEnterpriseModalOpen(true)}
                className="w-full py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-[#11141A] border border-[#232833] hover:border-slate-600 transition-colors"
              >
                Falar com Engenharia de Vendas
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          8. FOOTER (RODAPÉ SÓBRIO)
      ======================================================== */}
      <footer className="py-12 bg-[#0B0D10] text-xs text-[#8A8F98]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#232833]">
            {/* Coluna 1: Branding & Identidade */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-[#161A22] border border-[#232833] flex items-center justify-center text-amber-400">
                  <Zap className="h-3 w-3 fill-amber-400" />
                </div>
                <span className="font-bold text-sm tracking-wider text-white">VOLTAI</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Sistema Operacional Industrial para Engenharia Elétrica e Automação. Desenvolvido para
                o mercado industrial brasileiro.
              </p>
              <div className="pt-1 text-[10px] font-mono text-slate-500">
                PostgreSQL • Supabase RLS • IEC 61131-3
              </div>
            </div>

            {/* Coluna 2: Engenharia & Módulos */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-white font-semibold block mb-2">
                Módulos
              </span>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <button onClick={openWorkspaceFromLanding} className="hover:text-white transition-colors">
                    CAD Unifilar & Multifilar
                  </button>
                </li>
                <li>
                  <button onClick={openWorkspaceFromLanding} className="hover:text-white transition-colors">
                    Editor Ladder IEC 61131-3
                  </button>
                </li>
                <li>
                  <button onClick={openWorkspaceFromLanding} className="hover:text-white transition-colors">
                    Supervisório SCADA
                  </button>
                </li>
                <li>
                  <button onClick={openWorkspaceFromLanding} className="hover:text-white transition-colors">
                    Digital Twin 3D (WebGL)
                  </button>
                </li>
                <li>
                  <button onClick={openWorkspaceFromLanding} className="hover:text-white transition-colors">
                    Lista de Materiais (BOM)
                  </button>
                </li>
              </ul>
            </div>

            {/* Coluna 3: Normas & Conformidade */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-white font-semibold block mb-2">
                Normas & ABNT
              </span>
              <ul className="space-y-1.5 text-[11px]">
                <li>ABNT NBR 5410 (Instalações BT)</li>
                <li>ABNT NBR 14039 (Instalações MT)</li>
                <li>NR-10 (Segurança em Eletricidade)</li>
                <li>IEC 61131-3 (Programação CLP)</li>
                <li>PLCopen XML Specification</li>
              </ul>
            </div>

            {/* Coluna 4: Segurança & Governança */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-white font-semibold block mb-2">
                Segurança & Dados
              </span>
              <ul className="space-y-1.5 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <Lock className="h-3 w-3 text-[#10B981]" />
                  <span>Isolamento RLS Multi-tenant</span>
                </li>
                <li>LGPD e Criptografia em Trânsito (TLS 1.3)</li>
                <li>Air-Gapped Sandbox em Web Worker</li>
                <li>Auditoria de Tags e Histórico de Patches</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div>
              © 2026 VOLTAI (EletricAI) Tecnologia Industrial Ltda. Todos os direitos reservados.
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => alert('Termos de Uso VOLTAI: Plataforma em conformidade com as normas do CONFEA/CREA e LGPD.')}
                className="hover:text-white transition-colors"
              >
                Termos de Serviço
              </button>
              <button
                onClick={() => alert('Política de Privacidade: Dados industriais isolados por tenant via PostgreSQL RLS.')}
                className="hover:text-white transition-colors"
              >
                Privacidade
              </button>
              <button
                onClick={openLoginFromLanding}
                className="hover:text-white transition-colors text-amber-400"
              >
                Portal do Engenheiro →
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================
          MODAL: DEMO / ENTERPRISE CONTACT
      ======================================================== */}
      {enterpriseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#161A22] border border-[#232833] rounded-xl p-6 relative">
            <button
              onClick={() => setEnterpriseModalOpen(false)}
              className="absolute top-4 right-4 text-[#8A8F98] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {contactSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <div className="h-12 w-12 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] flex items-center justify-center mx-auto">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white">Solicitação Recebida</h3>
                <p className="text-xs text-[#8A8F98]">
                  Nosso time de engenharia de aplicações entrará em contato em até 4 horas úteis.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-base font-bold text-white">Falar com Engenharia de Aplicação</h3>
                <p className="text-xs text-[#8A8F98] mt-1 mb-5">
                  Converse com um especialista em integração SCADA, telemetria e conformidade ABNT.
                </p>

                <form onSubmit={handleContactSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-mono text-[#8A8F98] mb-1">
                      Nome do Engenheiro
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Ex: Carlos Eduardo Mendes"
                      className="w-full px-3 py-2 bg-[#11141A] border border-[#232833] rounded-lg text-white text-xs font-sans focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#8A8F98] mb-1">
                      E-mail Corporativo
                    </label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="engenharia@empresa.com.br"
                      className="w-full px-3 py-2 bg-[#11141A] border border-[#232833] rounded-lg text-white text-xs font-sans focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#8A8F98] mb-1">
                      Empresa / Planta Industrial
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.company}
                      onChange={e => setContactForm({ ...contactForm, company: e.target.value })}
                      placeholder="Ex: Usina Açucareira Tietê"
                      className="w-full px-3 py-2 bg-[#11141A] border border-[#232833] rounded-lg text-white text-xs font-sans focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#8A8F98] mb-1">
                      Segmento da Instalação
                    </label>
                    <select
                      value={contactForm.plantType}
                      onChange={e => setContactForm({ ...contactForm, plantType: e.target.value })}
                      className="w-full px-3 py-2 bg-[#11141A] border border-[#232833] rounded-lg text-white text-xs font-sans focus:outline-none focus:border-amber-500"
                    >
                      <option value="Agroindústria / Alimentos">Agroindústria / Alimentos</option>
                      <option value="Siderurgia / Metalurgia">Siderurgia / Metalurgia</option>
                      <option value="Química / Petroquímica">Química / Petroquímica</option>
                      <option value="Geração de Energia / Solar / PCH">Geração de Energia / Solar / PCH</option>
                      <option value="Integrador OEM de Painéis">Integrador OEM de Painéis</option>
                    </select>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEnterpriseModalOpen(false)}
                      className="px-3.5 py-2 rounded-lg bg-[#11141A] text-slate-300 hover:text-white text-xs font-mono"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-[#F59E0B] hover:bg-amber-400 text-[#0B0D10] text-xs font-mono font-bold"
                    >
                      Enviar Solicitação
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
