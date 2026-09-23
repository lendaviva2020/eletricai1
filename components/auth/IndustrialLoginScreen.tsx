'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import { PasswordRecoveryScreen } from '@/components/auth/PasswordRecoveryScreen';
import {
  Zap,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  Check,
  CheckCircle2,
  Cpu,
  Activity,
  Layers,
  Sparkles,
  AlertCircle,
  X,
  FileCode,
  Radio,
  KeyRound,
} from 'lucide-react';

export function IndustrialLoginScreen() {
  const { login, tenant, setTenant, setIsViewingLanding } = useWorkspace();

  // Form states
  const [emailOrTag, setEmailOrTag] = useState('carlos.mendes@paulinia.ind.br');
  const [password, setPassword] = useState('VoltAI#2026!Sec');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Modals
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [requestDemoOpen, setRequestDemoOpen] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  // Simulated live telemetry numbers for high-density industrial cyber feel
  const [liveFreq, setLiveFreq] = useState(60.02);
  const [liveVolt, setLiveVolt] = useState(380.4);
  const [livePower, setLivePower] = useState(142.8);
  const [liveScanTime, setLiveScanTime] = useState(1.8);
  const [tagCount, setTagCount] = useState(1420);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveFreq(prev => +(60.0 + (Math.sin(Date.now() / 3000) * 0.05)).toFixed(2));
      setLiveVolt(prev => +(380.0 + (Math.cos(Date.now() / 2500) * 1.2)).toFixed(1));
      setLivePower(prev => +(142.5 + (Math.sin(Date.now() / 4000) * 1.5)).toFixed(1));
      setLiveScanTime(prev => +(1.8 + (Math.sin(Date.now() / 2000) * 0.2)).toFixed(1));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrTag.trim()) {
      setLoginError('Informe seu e-mail profissional ou TAG ID industrial.');
      return;
    }
    if (!password) {
      setLoginError('Informe sua credencial de acesso.');
      return;
    }

    setLoginError(null);
    setIsLoading(true);

    // Realistic authentication delay simulation
    setTimeout(() => {
      setIsLoading(false);
      const isBeatriz = emailOrTag.toLowerCase().includes('beatriz');
      login(emailOrTag, isBeatriz ? 'engineer' : 'admin');
    }, 600);
  };

  const handleOAuthLogin = (provider: 'google' | 'sso') => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login(
        provider === 'google' ? 'eng.google@industria.com.br' : 'sso.corporativo@paulinia.ind.br',
        'admin'
      );
    }, 700);
  };

  const handleSelectQuickDemo = (profile: 'carlos' | 'beatriz') => {
    if (profile === 'carlos') {
      setEmailOrTag('carlos.mendes@paulinia.ind.br');
      setPassword('AdminVolt#2026');
    } else {
      setEmailOrTag('beatriz.lima@usina.com.br');
      setPassword('AutomaPLC#2026');
    }
  };

  // If user clicks "Esqueceu a senha?", render the high-density PasswordRecoveryScreen directly
  if (forgotPasswordOpen) {
    return (
      <PasswordRecoveryScreen
        defaultEmail={emailOrTag}
        onBackToLogin={() => setForgotPasswordOpen(false)}
      />
    );
  }

  return (
    <div className="min-h-screen w-screen bg-[#0B0D10] text-slate-100 flex flex-col lg:flex-row overflow-x-hidden select-none font-sans">
      {/* ========================================================
          LEFT SIDE: BRAND & VALUE PROPOSITION PANEL
          Deep Dark Slate Canvas with subtle glowing amber schematic grid
      ======================================================== */}
      <div className="relative flex-1 bg-[#0B0D10] flex flex-col justify-between p-8 sm:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-[#232833] overflow-hidden">
        {/* Subtle glowing amber/cyan grid & schematic vector background */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="industrial-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#232833" strokeWidth="0.8" />
                <circle cx="0" cy="0" r="1.5" fill="#F59E0B" fillOpacity="0.3" />
              </pattern>
              <linearGradient id="amberGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#0B0D10" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#industrial-grid)" />
            <circle cx="20%" cy="30%" r="280" fill="url(#amberGlow)" filter="blur(70px)" />
            <circle cx="85%" cy="80%" r="320" fill="url(#amberGlow)" filter="blur(90px)" />

            {/* Electrical schematic vector lines simulating industrial busbar */}
            <g opacity="0.35" stroke="#F59E0B" strokeWidth="1.2" fill="none">
              <path d="M 50 140 H 420 V 280 H 680" strokeDasharray="6 4" />
              <path d="M 120 140 V 220" />
              <circle cx="120" cy="220" r="4" fill="#F59E0B" />
              <rect x="110" y="225" width="20" height="28" rx="2" stroke="#F59E0B" fill="#161A22" />
              <text x="138" y="243" fill="#F59E0B" fontSize="9" fontFamily="monospace">Q01_TRAFO 500kVA</text>

              <path d="M 320 140 V 360 H 460" />
              <circle cx="320" cy="140" r="3" fill="#F59E0B" />
              <rect x="310" y="250" width="20" height="28" rx="2" stroke="#10B981" fill="#161A22" />
              <text x="338" y="268" fill="#10B981" fontSize="9" fontFamily="monospace">Q02_COMPRESSOR 75kW</text>

              <path d="M 680 280 V 420" stroke="#06B6D4" />
              <circle cx="680" cy="420" r="4" fill="#06B6D4" />
              <text x="695" y="424" fill="#06B6D4" fontSize="9" fontFamily="monospace">CLP %Q0.2 [KM01]</text>
            </g>
          </svg>
        </div>

        {/* TOP BRANDING BAR */}
        <div className="relative z-10">
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setIsViewingLanding(true)}
              className="text-xs font-mono text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors group"
            >
              <span className="text-amber-400 transition-transform group-hover:-translate-x-0.5">←</span>
              <span>Voltar para a Landing Page Institucional</span>
            </button>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Amber electric bolt icon */}
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500/25 via-amber-500/10 to-transparent border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.35)]">
              <Zap className="h-6 w-6 fill-amber-400" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black tracking-wider text-slate-100 font-sans">
                  ELETRIC<span className="text-amber-400 font-black">AI</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold tracking-tight">
                  VOLTAI Engine
                </span>
                <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-[#161A22] border border-[#232833] text-slate-400 font-mono">
                  v2.4 LTS
                </span>
              </div>
              <p className="text-xs text-slate-400 tracking-tight font-medium">
                Industrial Engineering & Automation Operating System
              </p>
            </div>
          </div>
        </div>

        {/* MIDDLE CONTENT: HEADLINE & VALUE PROPOSITION */}
        <div className="relative z-10 my-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-6">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ENGENHARIA DETERMINÍSTICA • NBR 5410 / NR-10</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-100 leading-[1.15]">
            O Sistema Operacional{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
              Industrial com IA
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Unifique CAD Unifilar, Ladder IEC 61131, SCADA e Digital Twin 3D numa única engine de tags.
          </p>

          {/* FEATURE HIGHLIGHT FLOATING CARD */}
          <div className="mt-8 bg-[#161A22]/90 backdrop-blur-md border border-[#232833] hover:border-amber-500/40 rounded-xl p-5 shadow-2xl transition-all duration-300">
            {/* Header row with status pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#232833]/80">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs font-mono font-semibold text-slate-200">
                  Tags Ativas:{' '}
                  <span className="text-amber-400 font-bold">{tagCount.toLocaleString('pt-BR')}</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-mono font-bold text-emerald-400">
                  NBR 5410: 100% Conforme
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[11px] font-mono font-medium text-amber-300">
                  Telemetria Modbus TCP: Online
                </span>
              </div>
            </div>

            {/* Live Real-time Ticker Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="bg-[#11141A] p-2.5 rounded-lg border border-[#232833]">
                <span className="text-[10px] text-slate-400 font-mono block">Frequência da Rede</span>
                <span className="text-sm font-mono font-bold text-slate-100 flex items-center gap-1">
                  {liveFreq.toFixed(2)}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">Hz</span>
                </span>
              </div>

              <div className="bg-[#11141A] p-2.5 rounded-lg border border-[#232833]">
                <span className="text-[10px] text-slate-400 font-mono block">Barramento RMS</span>
                <span className="text-sm font-mono font-bold text-amber-400 flex items-center gap-1">
                  {liveVolt.toFixed(1)}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">V</span>
                </span>
              </div>

              <div className="bg-[#11141A] p-2.5 rounded-lg border border-[#232833]">
                <span className="text-[10px] text-slate-400 font-mono block">Carga Ativa</span>
                <span className="text-sm font-mono font-bold text-emerald-400 flex items-center gap-1">
                  {livePower.toFixed(1)}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">kW</span>
                </span>
              </div>

              <div className="bg-[#11141A] p-2.5 rounded-lg border border-[#232833]">
                <span className="text-[10px] text-slate-400 font-mono block">Scan Cycle CLP</span>
                <span className="text-sm font-mono font-bold text-cyan-400 flex items-center gap-1">
                  {liveScanTime.toFixed(1)}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">ms</span>
                </span>
              </div>
            </div>
          </div>

          {/* Standards pill row */}
          <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="px-2 py-1 rounded bg-[#161A22] border border-[#232833] text-slate-300">
              NBR 5410 (BT)
            </span>
            <span className="px-2 py-1 rounded bg-[#161A22] border border-[#232833] text-slate-300">
              NBR 14039 (MT)
            </span>
            <span className="px-2 py-1 rounded bg-[#161A22] border border-[#232833] text-slate-300">
              NR-10 Prontuário
            </span>
            <span className="px-2 py-1 rounded bg-[#161A22] border border-[#232833] text-slate-300">
              IEC 61131-3 (ST/Ladder)
            </span>
            <span className="px-2 py-1 rounded bg-[#161A22] border border-[#232833] text-slate-300">
              PLCopen XML
            </span>
          </div>
        </div>

        {/* BOTTOM METRIC / TRUST BADGE */}
        <div className="relative z-10 pt-4 border-t border-[#232833]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Infraestrutura Industrial Air-Gapped & ISO/IEC 27001</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Tenant Ativo: <span className="text-slate-200 font-semibold">{tenant.name}</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          RIGHT SIDE: AUTHENTICATION FORM PANEL
          Centered High-Density Authentication Card
      ======================================================== */}
      <div className="flex-1 bg-[#0B0D10] flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-[460px] bg-[#161A22] border border-[#232833] shadow-[0_20px_60px_rgba(0,0,0,0.7)] rounded-2xl p-7 sm:p-9 relative">
          {/* Subtle electric amber top edge indicator */}
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

          {/* CARD HEADER */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-amber-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Radio className="h-3 w-3 animate-pulse text-amber-400" />
                Acesso Seguro
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C212C] border border-[#232833] text-slate-400">
                SSL 256-bit
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-100 tracking-tight mt-2">
              Acesse seu Workspace
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Entre com suas credenciais industriais
            </p>
          </div>

          {/* QUICK DEMO PROFILES (1-CLICK TEST) */}
          <div className="mb-6 p-3 rounded-xl bg-[#11141A] border border-[#232833]">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <KeyRound className="h-3 w-3" />
                Preenchimento Rápido (Demo):
              </span>
              <span className="text-[10px] text-slate-500">Clique para testar</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectQuickDemo('carlos')}
                className={`px-2.5 py-1.5 rounded text-left transition-all border text-xs font-mono flex flex-col ${
                  emailOrTag.includes('carlos')
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                    : 'bg-[#161A22] border-[#232833] text-slate-300 hover:border-slate-600'
                }`}
              >
                <span className="font-bold flex items-center gap-1">
                  Eng. Carlos Mendes
                </span>
                <span className="text-[10px] text-slate-400">Admin (CREA-SP)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickDemo('beatriz')}
                className={`px-2.5 py-1.5 rounded text-left transition-all border text-xs font-mono flex flex-col ${
                  emailOrTag.includes('beatriz')
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                    : 'bg-[#161A22] border-[#232833] text-slate-300 hover:border-slate-600'
                }`}
              >
                <span className="font-bold flex items-center gap-1">
                  Engª. Beatriz Lima
                </span>
                <span className="text-[10px] text-slate-400">Automação / CLP</span>
              </button>
            </div>
          </div>

          {/* LOGIN FORM */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Field 1: Email / TAG ID */}
            <div>
              <label
                htmlFor="emailOrTag"
                className="block text-xs font-medium text-slate-300 mb-1.5 font-sans"
              >
                E-mail profissional / TAG ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="emailOrTag"
                  type="text"
                  value={emailOrTag}
                  onChange={e => setEmailOrTag(e.target.value)}
                  placeholder="engenheiro@empresa.com.br"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#1C212C] border border-[#232833] rounded-lg text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all font-mono"
                  required
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-300 mb-1.5 font-sans"
              >
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-[#1C212C] border border-[#232833] rounded-lg text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-amber-400 transition-colors"
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* UTILITIES ROW: REMEMBER DEVICE & FORGOT PASSWORD */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-slate-200">
                <button
                  type="button"
                  onClick={() => setRememberDevice(!rememberDevice)}
                  className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                    rememberDevice
                      ? 'bg-amber-500 border-amber-500 text-[#0B0D10]'
                      : 'bg-[#1C212C] border-[#232833]'
                  }`}
                >
                  {rememberDevice && <Check className="h-3 w-3 stroke-[3]" />}
                </button>
                <span>Lembrar deste dispositivo</span>
              </label>

              <button
                type="button"
                onClick={() => setForgotPasswordOpen(true)}
                className="text-amber-400 hover:text-amber-300 font-medium transition-colors hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>

            {/* PRIMARY ACTION BUTTON: ELECTRIC AMBER */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#F59E0B] hover:bg-amber-400 text-[#0B0D10] font-black py-3 px-4 rounded-lg shadow-[0_0_22px_rgba(245,158,11,0.28)] flex items-center justify-center gap-2 text-sm tracking-wide transition-all transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer uppercase"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-[#0B0D10] border-t-transparent rounded-full animate-spin" />
                    <span>AUTENTICANDO CREDENCIAIS...</span>
                  </div>
                ) : (
                  <>
                    <span>ENTRAR NA PLATAFORMA</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* OAUTH / SOCIAL LOGIN SECTION */}
          <div className="mt-6">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#232833]" />
              <span className="flex-shrink mx-3 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                ou continue com
              </span>
              <div className="flex-grow border-t border-[#232833]" />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#1C212C] border border-[#232833] hover:border-slate-500 hover:bg-[#232833] text-xs font-semibold text-slate-200 transition-all cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>

              {/* Enterprise SSO / GitHub Button */}
              <button
                type="button"
                onClick={() => handleOAuthLogin('sso')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#1C212C] border border-[#232833] hover:border-slate-500 hover:bg-[#232833] text-xs font-semibold text-slate-200 transition-all cursor-pointer"
              >
                <Building2 className="h-4 w-4 text-cyan-400" />
                <span>SSO Corporativo</span>
              </button>
            </div>
          </div>

          {/* CARD FOOTER */}
          <div className="mt-7 pt-4 border-t border-[#232833] text-center">
            <p className="text-xs text-slate-400">
              Não possui conta?{' '}
              <button
                type="button"
                onClick={() => setRequestDemoOpen(true)}
                className="text-amber-400 hover:text-amber-300 font-bold hover:underline ml-1"
              >
                Solicitar demonstração ou cadastro
              </button>
            </p>

            <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Protegido por Supabase Multi-Tenant RLS • Conformidade ABNT</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL: ESQUECEU A SENHA?
      ======================================================== */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#161A22] border border-[#232833] rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setForgotPasswordOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 text-amber-400 mb-3">
              <KeyRound className="h-5 w-5" />
              <h3 className="font-bold text-lg text-slate-100">Recuperação de Acesso</h3>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Por motivos de segurança industrial e conformidade com a NR-10, o reset de senhas
              requer validação via token corporativo ou confirmação do Administrador do Tenant.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-mono">
                  E-mail corporativo cadastrado
                </label>
                <input
                  type="email"
                  defaultValue={emailOrTag}
                  className="w-full px-3 py-2 bg-[#1C212C] border border-[#232833] rounded text-slate-200 text-xs font-mono"
                />
              </div>

              <div className="p-3 rounded bg-[#11141A] border border-[#232833] text-[11px] font-mono text-slate-400">
                <span className="text-amber-400 block font-bold mb-1">
                  Central de Suporte da Subestação:
                </span>
                Ramal Interno: 4099 • WhatsApp Operacional: +55 (19) 3998-1000
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setForgotPasswordOpen(false)}
                className="px-3 py-1.5 rounded bg-[#1C212C] text-slate-300 hover:bg-[#232833] text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setForgotPasswordOpen(false);
                  alert('Instruções de redefinição enviadas para o e-mail cadastrado.');
                }}
                className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-[#0B0D10] text-xs font-bold"
              >
                Enviar Link de Recuperação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: SOLICITAR DEMONSTRAÇÃO OU CADASTRO
      ======================================================== */}
      {requestDemoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-[#161A22] border border-[#232833] rounded-2xl shadow-2xl p-6 sm:p-7 relative">
            <button
              onClick={() => {
                setRequestDemoOpen(false);
                setDemoSubmitted(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            {demoSubmitted ? (
              <div className="py-6 text-center">
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/40">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-100">Solicitação Registrada!</h3>
                <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto">
                  Nossa equipe de engenharia de aplicação entrará em contato para provisionar seu
                  ambiente de teste com CLP virtual e CAD Unifilar.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setRequestDemoOpen(false);
                    setDemoSubmitted(false);
                    // Log in as Carlos for immediate testing
                    login('carlos.mendes@paulinia.ind.br', 'admin');
                  }}
                  className="mt-5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#0B0D10] text-xs font-bold rounded-lg"
                >
                  Explorar Workspace Imediatamente (Modo Avaliação)
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2.5 text-amber-400 mb-2">
                  <Building2 className="h-5 w-5" />
                  <h3 className="font-bold text-lg text-slate-100">
                    Solicitar Acesso / Proposta Enterprise
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Cadastre sua indústria ou escritório de engenharia para receber uma instância
                  dedicada com isolamento Row Level Security (RLS).
                </p>

                <form
                  onSubmit={e => {
                    e.preventDefault();
                    setDemoSubmitted(true);
                  }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1 font-mono">
                        Nome do Engenheiro / RT
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Eng. Rodrigo Alves"
                        className="w-full px-3 py-2 bg-[#1C212C] border border-[#232833] rounded text-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1 font-mono">
                        Registro CREA
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: CREA-SP 5012345"
                        className="w-full px-3 py-2 bg-[#1C212C] border border-[#232833] rounded text-slate-200 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1 font-mono">
                        Empresa / Planta Industrial
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Petroquímica Sudeste"
                        className="w-full px-3 py-2 bg-[#1C212C] border border-[#232833] rounded text-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1 font-mono">
                        E-mail Corporativo
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="engenharia@empresa.com.br"
                        className="w-full px-3 py-2 bg-[#1C212C] border border-[#232833] rounded text-slate-200 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 font-mono">
                      Porte de Instalação Previsto
                    </label>
                    <select className="w-full px-3 py-2 bg-[#1C212C] border border-[#232833] rounded text-slate-200 text-xs">
                      <option>Até 500 Tags • Subestação BT (NBR 5410)</option>
                      <option>500 a 2.500 Tags • Média Tensão (NBR 14039) + CLP</option>
                      <option>Mais de 2.500 Tags • Planta Completa + Digital Twin 3D</option>
                    </select>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setRequestDemoOpen(false)}
                      className="px-3 py-1.5 rounded bg-[#1C212C] text-slate-300 hover:bg-[#232833] text-xs"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-[#0B0D10] text-xs font-bold uppercase tracking-wide"
                    >
                      Enviar Solicitação
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
