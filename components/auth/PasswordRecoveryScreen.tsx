'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import {
  Zap,
  ArrowLeft,
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  Radio,
  FileCheck,
  Server,
  Layers,
  Sparkles,
} from 'lucide-react';

interface PasswordRecoveryScreenProps {
  onBackToLogin: () => void;
  defaultEmail?: string;
}

export function PasswordRecoveryScreen({
  onBackToLogin,
  defaultEmail = 'carlos.mendes@paulinia.ind.br',
}: PasswordRecoveryScreenProps) {
  const { login } = useWorkspace();

  // Step state: 'request' | 'verify_and_reset' | 'completed'
  const [step, setStep] = useState<'request' | 'verify_and_reset' | 'completed'>('verify_and_reset');
  const [email, setEmail] = useState(defaultEmail);

  // 6-digit OTP code state
  const [otp, setOtp] = useState<string[]>(['8', '4', '1', '9', '0', '2']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password fields state
  const [newPassword, setNewPassword] = useState('EletricAI#2026@Sec!Prod');
  const [confirmPassword, setConfirmPassword] = useState('EletricAI#2026@Sec!Prod');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Resend Timer (105 seconds = 01:45)
  const [timeLeft, setTimeLeft] = useState(105);
  const [isResending, setIsResending] = useState(false);

  // Loading and Error handling
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // OTP handlers
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric inputs
    const cleanVal = value.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);

    // Auto-focus next input
    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const nextFocus = Math.min(pasted.length, 5);
    otpInputRefs.current[nextFocus]?.focus();
  };

  const handleResendCode = () => {
    if (timeLeft > 0) return;
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      setTimeLeft(105);
      setErrorMsg(null);
    }, 600);
  };

  // Password strength calculation
  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return Math.min(4, Math.max(1, score - 1));
  };

  const strengthScore = calculateStrength(newPassword);

  const handleSubmitReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      setErrorMsg('Informe os 6 dígitos completos do código OTP.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('A nova senha deve possuir no mínimo 8 caracteres industriais complexos.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('A confirmação da senha não coincide com a nova senha digitada.');
      return;
    }

    setIsSubmitting(true);
    // Simulate secure Supabase Auth token exchange
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('completed');
    }, 800);
  };

  return (
    <div className="min-h-screen w-screen bg-[#0B0D10] text-slate-100 flex flex-col lg:flex-row overflow-x-hidden select-none font-sans">
      {/* ========================================================
          LEFT PANEL: SECURITY PROTOCOL & COMPLIANCE
          Deep dark slate background with glowing amber schematic
      ======================================================== */}
      <div className="relative flex-1 bg-[#0B0D10] flex flex-col justify-between p-8 sm:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-[#232833] overflow-hidden">
        {/* Subtle glowing amber & cyan schematic vector lines */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="rec-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#232833" strokeWidth="0.8" />
                <circle cx="0" cy="0" r="1.5" fill="#F59E0B" fillOpacity="0.3" />
              </pattern>
              <linearGradient id="recAmberGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#10B981" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#0B0D10" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#rec-grid)" />
            <circle cx="30%" cy="25%" r="260" fill="url(#recAmberGlow)" filter="blur(70px)" />
            <circle cx="75%" cy="75%" r="300" fill="url(#recAmberGlow)" filter="blur(80px)" />

            {/* Industrial vector lines */}
            <g opacity="0.35" stroke="#F59E0B" strokeWidth="1.2" fill="none">
              <path d="M 60 180 H 380 V 320 H 620" strokeDasharray="6 4" />
              <circle cx="60" cy="180" r="4" fill="#F59E0B" />
              <rect x="220" y="165" width="32" height="30" rx="3" stroke="#F59E0B" fill="#161A22" />
              <text x="260" y="184" fill="#F59E0B" fontSize="10" fontFamily="monospace">
                SEC_TOKEN_GUARD [SIL-3]
              </text>
              <path d="M 380 320 V 460" stroke="#10B981" />
              <circle cx="380" cy="460" r="4" fill="#10B981" />
              <text x="395" y="464" fill="#10B981" fontSize="10" fontFamily="monospace">
                RLS_ISOLATION_OK
              </text>
            </g>
          </svg>
        </div>

        {/* TOP BRANDING BAR */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500/25 via-amber-500/10 to-transparent border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.35)]">
              <Zap className="h-6 w-6 fill-amber-400" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black tracking-wider text-slate-100 font-sans">
                  ELETRIC<span className="text-amber-400 font-black">AI</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold tracking-tight">
                  VOLTAI Engine v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400 tracking-tight font-medium">
                Módulo Criptográfico e Gestão de Identidade Industrial
              </p>
            </div>
          </div>
        </div>

        {/* MIDDLE CONTENT: SECURITY PROTOCOL & DETAILS */}
        <div className="relative z-10 my-8 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono mb-5">
            <Radio className="h-2.5 w-2.5 animate-pulse text-amber-400" />
            <span>SEGURANÇA INDUSTRIAL CRÍTICA • NR-10 & IEC 62443</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-100 leading-tight">
            Protocolo de Segurança &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
              Recuperação de Credenciais
            </span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            As chaves de acesso a subestações, barramentos de potência e controladores lógicos programáveis
            são protegidas por isolamento criptográfico multi-tenant de hardware.
          </p>

          {/* SECURITY DETAILS CARD */}
          <div className="mt-6 bg-[#161A22]/90 backdrop-blur-md border border-[#232833] rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#232833]">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Status do Procedimento Criptográfico
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                AUDIT LOG SIL-3
              </span>
            </div>

            {/* Micro Status List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-2.5 bg-[#11141A] rounded-lg border border-[#232833]">
                <span className="text-[10px] text-slate-500 font-mono block">Criptografia</span>
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  E2E: ATIVA
                </span>
              </div>

              <div className="p-2.5 bg-[#11141A] rounded-lg border border-[#232833]">
                <span className="text-[10px] text-slate-500 font-mono block">Token Único (OTP)</span>
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Expira em 15min
                </span>
              </div>

              <div className="p-2.5 bg-[#11141A] rounded-lg border border-[#232833]">
                <span className="text-[10px] text-slate-500 font-mono block">Isolamento</span>
                <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5 mt-0.5">
                  <Server className="h-3 w-3" />
                  Tenant RLS
                </span>
              </div>
            </div>

            {/* Interactive Notification Box in subtle amber highlight */}
            <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5 leading-relaxed font-sans">
              <KeyRound className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-amber-200">Aviso de Governança Industrial:</strong>{' '}
                Por questões de segurança da planta, o link e o código OTP são vinculados estritamente
                ao e-mail corporativo cadastrado no prontuário elétrico NR-10.
              </div>
            </div>
          </div>

          {/* Compliance Specs Badges */}
          <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
            <span className="px-2.5 py-1 rounded bg-[#161A22] border border-[#232833] text-slate-300">
              ISO/IEC 27001
            </span>
            <span className="px-2.5 py-1 rounded bg-[#161A22] border border-[#232833] text-slate-300">
              ISA/IEC 62443 (Cyber OT)
            </span>
            <span className="px-2.5 py-1 rounded bg-[#161A22] border border-[#232833] text-slate-300">
              Supabase Auth RLS
            </span>
            <span className="px-2.5 py-1 rounded bg-[#161A22] border border-[#232833] text-emerald-400/90 border-emerald-500/20">
              SHA-256 HMAC
            </span>
          </div>
        </div>

        {/* BOTTOM METRIC / TRUST BADGE */}
        <div className="relative z-10 pt-4 border-t border-[#232833]/60 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Servidor de Identidade: auth.eletricai.ind.br</span>
          <span className="text-emerald-400 font-medium">Conexão Segura TLS 1.3</span>
        </div>
      </div>

      {/* ========================================================
          RIGHT PANEL: PASSWORD RECOVERY INTERACTIVE FORM
          Centered high-density recovery card
      ======================================================== */}
      <div className="flex-1 bg-[#0B0D10] flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-[500px] bg-[#161A22] border border-[#232833] shadow-[0_20px_60px_rgba(0,0,0,0.7)] rounded-2xl p-7 sm:p-9 relative">
          {/* Subtle electric amber top edge indicator */}
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

          {/* TOP NAVIGATION: AMBER LINK BUTTON */}
          <div className="mb-5 flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToLogin}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 hover:text-amber-300 transition-colors group cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>← Voltar para o Login</span>
            </button>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C212C] border border-[#232833] text-slate-400">
              Etapa 2 de 2
            </span>
          </div>

          {step === 'completed' ? (
            /* SUCCESS FEEDBACK STATE */
            <div className="py-6 text-center animate-fade-in">
              <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
              </div>
              <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
                Chave Atualizada com Sucesso!
              </h2>
              <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto leading-relaxed">
                Suas credenciais industriais foram redefinidas e registradas no log de auditoria. Você
                já pode acessar todos os módulos de engenharia.
              </p>

              <div className="mt-6 p-3 bg-[#11141A] border border-[#232833] rounded-xl text-left text-xs font-mono text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>E-mail Autenticado:</span>
                  <span className="text-slate-200">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status da Sessão:</span>
                  <span className="text-emerald-400 font-bold">100% Validada</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => login(email, 'admin')}
                className="mt-6 w-full bg-[#F59E0B] hover:bg-amber-400 text-[#0B0D10] font-black py-3 px-4 rounded-lg shadow-[0_0_22px_rgba(245,158,11,0.28)] flex items-center justify-center gap-2 text-sm tracking-wide transition-all uppercase cursor-pointer"
              >
                <Lock className="h-4 w-4" />
                <span>ACESSAR WORKSPACE AGORA</span>
              </button>
            </div>
          ) : (
            /* RECOVERY FORM */
            <>
              {/* CARD TITLE & SUBTITLE */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
                  Redefinir Chave de Acesso
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Informe seu e-mail cadastrado para receber o token de verificação.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmitReset} className="space-y-5">
                {/* 1. IDENTIFICATION FIELD */}
                <div>
                  <label
                    htmlFor="recoveryEmail"
                    className="block text-xs font-medium text-slate-300 mb-1.5 font-sans"
                  >
                    E-mail Profissional ou TAG ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      id="recoveryEmail"
                      type="text"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="engenheiro@empresa.com.br"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#1C212C] border border-[#232833] rounded-lg text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all font-mono"
                      required
                    />
                  </div>
                </div>

                {/* 2. OTP CODE INPUT BOXES (6-DIGIT VERIFICATION) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-300 font-sans">
                      Código de Segurança OTP (6 Dígitos)
                    </label>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Token Ativo
                    </span>
                  </div>

                  {/* 6 Individual Dark Square Input Boxes with JetBrains Mono font */}
                  <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => {
                          otpInputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(index, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(index, e)}
                        onPaste={handlePasteOtp}
                        className="h-12 w-full text-center text-lg sm:text-xl font-mono font-bold rounded-lg bg-[#1C212C] border border-[#232833] text-amber-400 focus:bg-[#232833] focus:border-[#F59E0B] focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all shadow-inner"
                      />
                    ))}
                  </div>

                  {/* Resend timer badge below */}
                  <div className="mt-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                      <RefreshCw
                        className={`h-3 w-3 text-amber-400 ${isResending ? 'animate-spin' : ''}`}
                      />
                      <span>
                        Reenviar código em{' '}
                        <strong className="text-amber-400 font-bold">{formatTimer(timeLeft)}</strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={timeLeft > 0 || isResending}
                      onClick={handleResendCode}
                      className="text-[11px] font-mono font-bold text-amber-400 hover:text-amber-300 disabled:opacity-40 disabled:cursor-not-allowed hover:underline transition-colors"
                    >
                      Reenviar Agora
                    </button>
                  </div>
                </div>

                {/* 3. NEW PASSWORD FIELDS (WITH STRENGTH METER) */}
                <div className="space-y-3 pt-1 border-t border-[#232833]">
                  {/* New Password */}
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-xs font-medium text-slate-300 mb-1 font-sans"
                    >
                      Nova Senha
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="••••••••••••••••"
                        className="w-full pl-9 pr-10 py-2.5 bg-[#1C212C] border border-[#232833] rounded-lg text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-amber-400"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-medium text-slate-300 mb-1 font-sans"
                    >
                      Confirmar Nova Senha
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••••••"
                        className="w-full pl-9 pr-10 py-2.5 bg-[#1C212C] border border-[#232833] rounded-lg text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-amber-400"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Visual Password Strength Meter Bar below inputs */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-400">Complexidade da Senha:</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Forte / Complexa
                      </span>
                    </div>
                    {/* 4 Green Segment Bars */}
                    <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                      {[1, 2, 3, 4].map(idx => (
                        <div
                          key={idx}
                          className={`rounded-full transition-all duration-300 ${
                            idx <= strengthScore ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-[#232833]'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-1.5">
                      Requisitos: &gt;= 12 caracteres, maiúsculas, minúsculas, numerais e símbolos especiais.
                    </p>
                  </div>
                </div>

                {/* PRIMARY CTA BUTTON: FULL WIDTH ELECTRIC AMBER (#F59E0B) */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#F59E0B] hover:bg-amber-400 text-[#0B0D10] font-black py-3 px-4 rounded-lg shadow-[0_0_22px_rgba(245,158,11,0.28)] flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wide transition-all transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer uppercase"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-[#0B0D10] border-t-transparent rounded-full animate-spin" />
                        <span>VALIDANDO TOKEN SIL-3...</span>
                      </div>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 stroke-[2.5]" />
                        <span>REDEFINIR SENHA E ACESSAR PLATAFORMA</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* CARD FOOTER */}
              <div className="mt-6 pt-4 border-t border-[#232833] text-center space-y-2">
                <p className="text-xs text-slate-400">
                  Dúvidas ou bloqueio de conta?{' '}
                  <span className="text-amber-400 font-medium hover:underline cursor-pointer">
                    Entre em contato com o Administrador do Tenant.
                  </span>
                </p>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Supabase Auth • Multi-Tenant RLS Security</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
