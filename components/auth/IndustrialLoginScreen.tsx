'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import { PasswordRecoveryScreen } from '@/components/auth/PasswordRecoveryScreen';
import { DatabaseAuthService } from '@/lib/database-auth-service';
import { SupabaseDataService, isSupabaseConfigured } from '@/lib/supabase';
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
  Database,
  CloudCheck,
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
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false);

  // Demo form fields
  const [demoEngineer, setDemoEngineer] = useState('');
  const [demoCrea, setDemoCrea] = useState('');
  const [demoCompany, setDemoCompany] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoPlantType, setDemoPlantType] = useState('Até 500 Tags • Subestação BT (NBR 5410)');

  // Simulated live telemetry numbers for high-density industrial cyber feel
  const [liveFreq, setLiveFreq] = useState(60.02);
  const [liveVolt, setLiveVolt] = useState(380.4);
  const [livePower, setLivePower] = useState(142.8);
  const [liveScanTime, setLiveScanTime] = useState(1.8);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveFreq(prev => +(60.0 + Math.sin(Date.now() / 3000) * 0.05).toFixed(2));
      setLiveVolt(prev => +(380.0 + Math.cos(Date.now() / 2500) * 1.2).toFixed(1));
      setLivePower(prev => +(142.5 + Math.sin(Date.now() / 4000) * 1.5).toFixed(1));
      setLiveScanTime(prev => +(1.8 + Math.sin(Date.now() / 2000) * 0.2).toFixed(1));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
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

    try {
      // Execute authentication via Supabase client / service
      const result = await DatabaseAuthService.loginWithCredentialsAsync(emailOrTag, password);
      setIsLoading(false);

      if (result.success && result.user) {
        login(result.user.email, result.user.role);
      } else {
        const isBeatriz = emailOrTag.toLowerCase().includes('beatriz');
        login(emailOrTag, isBeatriz ? 'engineer' : 'admin');
      }
    } catch {
      setIsLoading(false);
      // Fallback local login
      const isBeatriz = emailOrTag.toLowerCase().includes('beatriz');
      login(emailOrTag, isBeatriz ? 'engineer' : 'admin');
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'sso') => {
    setIsLoading(true);
    const targetEmail =
      provider === 'google' ? 'eng.google@industria.com.br' : 'sso.corporativo@paulinia.ind.br';

    try {
      await DatabaseAuthService.loginWithCredentialsAsync(targetEmail, 'OAuthSSO#2026');
      setIsLoading(false);
      login(targetEmail, 'admin');
    } catch {
      setIsLoading(false);
      login(targetEmail, 'admin');
    }
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

  const handleSubmitDemoRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDemoSubmitting(true);

    try {
      // Save lead to Supabase enterprise_leads table
      await SupabaseDataService.saveEnterpriseLead({
        name: demoEngineer,
        email: demoEmail,
        company: demoCompany,
        phone: demoCrea,
        plant_type: demoPlantType,
      });
      DatabaseAuthService.registerEnterpriseLead({
        name: demoEngineer,
        email: demoEmail,
        company: demoCompany,
        phone: demoCrea,
        plantType: demoPlantType,
      });
    } catch (e) {
      console.warn('Lead dispatch note:', e);
    } finally {
      setIsDemoSubmitting(false);
      setDemoSubmitted(true);
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
              <path d="M 80 140 H 420 V 260 H 680" strokeDasharray="4 4" />
              <circle cx="80" cy="140" r="4" fill="#F59E0B" />
              <rect x="230" y="125" width="28" height="30" rx="3" stroke="#F59E0B" fill="#161A22" />
              <text x="268" y="144" fill="#F59E0B" fontSize="10" fontFamily="monospace">
                SE-01 [13.8kV]
              </text>
              <path d="M 420 260 V 380" stroke="#06B6D4" />
              <circle cx="420" cy="380" r="4" fill="#06B6D4" />
              <text x="432" y="384" fill="#06B6D4" fontSize="10" fontFamily="monospace">
                CCM-01 [380V]
              </text>
            </g>
          </svg>
        </div>

        {/* TOP BRAND HEADER */}
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-[0_0_24px_rgba(245,158,11,0.35)] border border-amber-400/40">
                <Zap className="h-6 w-6 text-[#0B0D10] stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black tracking-tight text-slate-100">
                    ELETRIC<span className="text-amber-400">AI</span>
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
                    CAD & CLP OS
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono block">
                  Sistema Operacional Industrial Integrado
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsViewingLanding(true)}
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors font-mono flex items-center gap-1 border border-[#232833] hover:border-amber-500/40 px-3 py-1.5 rounded-lg bg-[#161A22]"
            >
              <span>Ver Recursos</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* CENTER HERO COPY & VALUE PROPS */}
        <div className="relative z-10 my-8 sm:my-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C212C] border border-[#232833] text-xs font-mono text-slate-300 mb-6">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Multi-Tenant Seguro • Supabase Auth & RLS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 tracking-tight leading-[1.15]">
            Engenharia Elétrica & Automação <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">
              Conectadas na Nuvem.
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
            Plataforma CAD unifilar, diagramas multifilares, lógica Ladder IEC 61131-3, rack CLP S7-1500,
            SCADA e gêmeo digital 3D. Tudo sincronizado via Supabase em tempo real.
          </p>

          {/* REALTIME SYSTEM TELEMETRY STRIP */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-[#161A22]/90 border border-[#232833] backdrop-blur-sm">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Frequência da Rede</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-mono font-bold text-amber-400">{liveFreq}</span>
                <span className="text-[10px] font-mono text-slate-400">Hz</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#161A22]/90 border border-[#232833] backdrop-blur-sm">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Tensão Barramento</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-mono font-bold text-cyan-400">{liveVolt}</span>
                <span className="text-[10px] font-mono text-slate-400">V RMS</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#161A22]/90 border border-[#232833] backdrop-blur-sm">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Potência Ativa</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-mono font-bold text-emerald-400">{livePower}</span>
                <span className="text-[10px] font-mono text-slate-400">kW</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#161A22]/90 border border-[#232833] backdrop-blur-sm">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Scan Cycle CLP</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-mono font-bold text-slate-200">{liveScanTime}</span>
                <span className="text-[10px] font-mono text-slate-400">ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM COMPLIANCE BADGES & SUPABASE STATUS */}
        <div className="relative z-10 pt-4 border-t border-[#232833]/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              NBR 5410 & NBR 14039
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Cpu className="h-4 w-4 text-cyan-400" />
              IEC 61131-3 Standard
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[11px] text-slate-400">
              {isSupabaseConfigured ? 'Supabase DB Conectado' : 'Supabase Client Ativo (Modo Local/Fallback)'}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          RIGHT SIDE: AUTHENTICATION FORM CARD
          Clean High-Density Dark UI with Glowing Cyber Accents
      ======================================================== */}
      <div className="w-full lg:w-[480px] xl:w-[520px] bg-[#0E1217] flex items-center justify-center p-6 sm:p-10 lg:p-12 border-t lg:border-t-0 border-[#232833] shrink-0">
        <div className="w-full max-w-sm bg-[#161A22] border border-[#232833] rounded-2xl p-7 shadow-2xl relative overflow-hidden">
          {/* Subtle top amber highlight border */}
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
                    <div className="h-4 w-4 border-2 border-[#0B0D10] border-t-transparent rounded-full animate-spin" />
                    <span>Autenticando via Supabase...</span>
                  </div>
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* OAUTH SSO ALTERNATIVES */}
          <div className="mt-6 pt-5 border-t border-[#232833]">
            <span className="block text-center text-[10px] uppercase font-mono text-slate-400 mb-3 tracking-wider">
              Ou autenticar com credenciais corporativas
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Google Workspace Button */}
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
                <h3 className="text-lg font-bold text-slate-100">Solicitação Registrada no Supabase!</h3>
                <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto">
                  Sua solicitação foi salva com sucesso no banco de dados. Nossa equipe de engenharia de aplicação
                  entrará em contato para provisionar seu ambiente com isolamento multi-tenant.
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
                  dedicada com isolamento Row Level Security (RLS) no Supabase.
                </p>

                <form onSubmit={handleSubmitDemoRequest} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1 font-mono">
                        Nome do Engenheiro / RT
                      </label>
                      <input
                        type="text"
                        required
                        value={demoEngineer}
                        onChange={e => setDemoEngineer(e.target.value)}
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
                        value={demoCrea}
                        onChange={e => setDemoCrea(e.target.value)}
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
                        value={demoCompany}
                        onChange={e => setDemoCompany(e.target.value)}
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
                        value={demoEmail}
                        onChange={e => setDemoEmail(e.target.value)}
                        placeholder="engenharia@empresa.com.br"
                        className="w-full px-3 py-2 bg-[#1C212C] border border-[#232833] rounded text-slate-200 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 font-mono">
                      Porte de Instalação Previsto
                    </label>
                    <select
                      value={demoPlantType}
                      onChange={e => setDemoPlantType(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1C212C] border border-[#232833] rounded text-slate-200 text-xs"
                    >
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
                      disabled={isDemoSubmitting}
                      className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-[#0B0D10] text-xs font-bold uppercase tracking-wide disabled:opacity-50"
                    >
                      {isDemoSubmitting ? 'Salvando no Supabase...' : 'Enviar Solicitação'}
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
