'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ElectricalAppIcon } from '@/components/shared/ElectricalAppIcon';
import {
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
  Server,
  Copy,
  Check,
  X,
} from 'lucide-react';

interface PasswordRecoveryScreenProps {
  onBackToLogin: () => void;
  defaultEmail?: string;
}

export function PasswordRecoveryScreen({
  onBackToLogin,
  defaultEmail = '',
}: PasswordRecoveryScreenProps) {
  // Step state: 'request' | 'verify_and_reset' | 'completed'
  const [step, setStep] = useState<'request' | 'verify_and_reset' | 'completed'>('request');
  const [email, setEmail] = useState(defaultEmail);

  // 6-digit OTP code state
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Generated OTP feedback for instant sandbox testing
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Password fields state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Resend Timer (120 seconds = 02:00)
  const [timeLeft, setTimeLeft] = useState(120);
  const [isResending, setIsResending] = useState(false);

  // Loading and Error handling
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Password criteria
  const hasMinLength = newPassword.length >= 8;
  const hasUpperLower = /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUpperLower && hasNumber && hasSpecial;

  // Countdown timer effect
  useEffect(() => {
    if (step !== 'verify_and_reset' || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // OTP handlers
  const handleOtpChange = (index: number, value: string) => {
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
    fillOtpCode(pasted);
  };

  const fillOtpCode = (code: string) => {
    const chars = code.split('').slice(0, 6);
    const newOtp = ['', '', '', '', '', ''];
    for (let i = 0; i < chars.length; i++) {
      newOtp[i] = chars[i];
    }
    setOtp(newOtp);
    const nextFocus = Math.min(chars.length, 5);
    otpInputRefs.current[nextFocus]?.focus();
  };

  // Step 1 Handler: Request OTP Code
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Informe um endereço de e-mail corporativo válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha ao solicitar código de recuperação.');
      }

      setGeneratedOtp(data.otpCode || null);
      if (data.otpCode) {
        fillOtpCode(data.otpCode);
      }

      setInfoMsg('Código de segurança gerado com sucesso! Insira-o abaixo com sua nova senha.');
      setTimeLeft(120);
      setStep('verify_and_reset');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na comunicação com o servidor de autenticação.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP Code
  const handleResendCode = async () => {
    if (timeLeft > 0) return;
    setIsResending(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/reset-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha ao reenviar código.');
      }

      setGeneratedOtp(data.otpCode || null);
      if (data.otpCode) {
        fillOtpCode(data.otpCode);
      }
      setTimeLeft(120);
      setInfoMsg('Novo código OTP reenviado com sucesso.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao reenviar código.';
      setErrorMsg(msg);
    } finally {
      setIsResending(false);
    }
  };

  // Step 2 Handler: Verify OTP & Change Password
  const handleSubmitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const enteredOtp = otp.join('').trim();
    if (enteredOtp.length < 4) {
      setErrorMsg('Informe os 6 dígitos completos do código de verificação OTP.');
      return;
    }

    if (!hasMinLength) {
      setErrorMsg('A nova senha precisa ter no mínimo 8 dígitos/caracteres.');
      return;
    }

    if (!hasUpperLower) {
      setErrorMsg('A senha precisa conter tanto letras maiúsculas quanto minúsculas.');
      return;
    }

    if (!hasNumber) {
      setErrorMsg('A senha precisa conter pelo menos um número (0-9).');
      return;
    }

    if (!hasSpecial) {
      setErrorMsg('A senha precisa conter pelo menos um caractere especial (!@#$%...).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('A confirmação da senha não coincide com a nova senha digitada.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          token: enteredOtp,
          newPassword: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha ao redefinir credencial.');
      }

      setStep('completed');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao redefinir senha.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyOtp = () => {
    if (!generatedOtp) return;
    navigator.clipboard.writeText(generatedOtp);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="min-h-screen w-screen bg-[#0B0D10] text-slate-100 flex flex-col lg:flex-row overflow-x-hidden select-none font-sans text-xs sm:text-sm">
      {/* ========================================================
          LEFT PANEL: SECURITY PROTOCOL & INDUSTRIAL GOVERNANCE
      ======================================================== */}
      <div className="relative flex-1 bg-[#0B0D10] flex flex-col justify-between p-6 sm:p-10 lg:p-14 border-b lg:border-b-0 lg:border-r border-[#232833] overflow-hidden">
        {/* Schematic background grid */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="rec-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#232833" strokeWidth="0.8" />
                <circle cx="0" cy="0" r="1.5" fill="#F59E0B" fillOpacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#rec-grid)" />
          </svg>
        </div>

        {/* TOP BRANDING BAR */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5">
            <ElectricalAppIcon size="xl" withGlow />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black tracking-wider text-slate-100 font-sans">
                  ELETRIC<span className="text-amber-400 font-black">AI</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold">
                  v2.4 LTS
                </span>
              </div>
              <p className="text-xs text-slate-400 tracking-tight font-medium mt-0.5">
                Módulo Criptográfico e Gestão de Identidade Industrial
              </p>
            </div>
          </div>
        </div>

        {/* MIDDLE CONTENT: SECURITY PROTOCOL */}
        <div className="relative z-10 my-8 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono mb-4">
            <Radio className="h-3 w-3 animate-pulse text-amber-400" />
            <span>SEGURANÇA INDUSTRIAL CRÍTICA • NR-10 & IEC 62443</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-100 leading-tight">
            Protocolo de Segurança &{' '}
            <span className="text-amber-400">
              Recuperação de Credenciais
            </span>
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            As chaves de acesso a subestações, barramentos de potência e controladores lógicos programáveis
            são protegidas por isolamento criptográfico multi-tenant e logs de auditoria técnica.
          </p>

          {/* SECURITY DETAILS CARD */}
          <div className="mt-6 bg-[#161A22] border border-[#232833] rounded-xl p-5 sm:p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#232833]">
              <span className="text-xs font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Procedimento Criptográfico
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                AUDITORIA ATIVA
              </span>
            </div>

            {/* Status Grid: Balanced 3-Column Spacing (gap-4 sm:gap-5) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              <div className="p-4 bg-[#11141A] rounded-xl border border-[#232833] flex flex-col justify-between hover:border-[#2f3644] transition-all">
                <span className="text-xs text-slate-400 font-mono block">Criptografia</span>
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 mt-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                  TLS 1.3 / E2E
                </span>
              </div>

              <div className="p-4 bg-[#11141A] rounded-xl border border-[#232833] flex flex-col justify-between hover:border-[#2f3644] transition-all">
                <span className="text-xs text-slate-400 font-mono block">Token OTP</span>
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5 mt-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  Validade 60min
                </span>
              </div>

              <div className="p-4 bg-[#11141A] rounded-xl border border-[#232833] flex flex-col justify-between hover:border-[#2f3644] transition-all">
                <span className="text-xs text-slate-400 font-mono block">Isolamento</span>
                <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5 mt-2">
                  <Server className="h-3.5 w-3.5 shrink-0" />
                  Multi-Tenant RLS
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3 leading-relaxed font-sans">
              <KeyRound className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-amber-300">Governança de Acesso:</strong>{' '}
                O código OTP de 6 dígitos é gerado de forma única para o e-mail corporativo cadastrado
                no prontuário de engenharia.
              </div>
            </div>
          </div>

          {/* Compliance Badges */}
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-mono text-slate-300">
            <span className="px-2.5 py-1 rounded bg-[#161A22] border border-[#232833]">
              NBR 5410 / NR-10
            </span>
            <span className="px-2.5 py-1 rounded bg-[#161A22] border border-[#232833]">
              ISA/IEC 62443
            </span>
            <span className="px-2.5 py-1 rounded bg-[#161A22] border border-[#232833]">
              Isolamento RLS
            </span>
            <span className="px-2.5 py-1 rounded bg-[#161A22] border border-[#232833] text-emerald-400">
              SHA-256 HMAC
            </span>
          </div>
        </div>

        {/* BOTTOM STATUS */}
        <div className="relative z-10 pt-4 border-t border-[#232833] flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Servidor de Identidade: auth.eletricai.ind.br</span>
          <span className="text-emerald-400 font-medium">Conexão Segura Ativa</span>
        </div>
      </div>

      {/* ========================================================
          RIGHT PANEL: INTERACTIVE RECOVERY FORM
      ======================================================== */}
      <div className="flex-1 bg-[#0B0D10] flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-[520px] bg-[#161A22] border border-[#232833] shadow-2xl rounded-2xl p-6 sm:p-8 relative">
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

          {/* TOP NAVIGATION */}
          <div className="mb-5 flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToLogin}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 hover:text-amber-300 transition-colors group cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span>← Voltar para o Login</span>
            </button>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#1C212C] border border-[#232833] text-slate-300">
              {step === 'request' ? 'Etapa 1 de 2' : step === 'verify_and_reset' ? 'Etapa 2 de 2' : 'Concluído'}
            </span>
          </div>

          {/* STATE 1: COMPLETED */}
          {step === 'completed' && (
            <div className="py-6 text-center animate-fade-in space-y-4">
              <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
              </div>
              <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
                Senha Atualizada com Sucesso!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                Suas novas credenciais industriais foram redefinidas e registradas no sistema. Você
                já pode acessar sua organização e projetos normalmente.
              </p>

              <div className="p-3.5 bg-[#11141A] border border-[#232833] rounded-xl text-left text-xs font-mono text-slate-300 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">E-mail:</span>
                  <span className="text-slate-100 font-bold">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status da Credencial:</span>
                  <span className="text-emerald-400 font-bold">100% Atualizada & Pronta</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full bg-[#F59E0B] hover:bg-amber-400 text-[#0B0D10] font-black py-3 px-4 rounded-lg shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wide transition-all uppercase cursor-pointer"
              >
                <Lock className="h-4 w-4" />
                <span>ACESSAR COM A NOVA SENHA</span>
              </button>
            </div>
          )}

          {/* STATE 2: STEP 1 - REQUEST OTP CODE */}
          {step === 'request' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
                  Recuperar Senha de Acesso
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
                  Informe o e-mail da sua conta para receber o código OTP de redefinição.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label
                    htmlFor="requestEmail"
                    className="block text-xs font-semibold text-slate-200 mb-1.5"
                  >
                    E-mail Corporativo Cadastrado
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      id="requestEmail"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="seu.email@empresa.com.br"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#1C212C] border border-[#232833] rounded-lg text-slate-100 text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-[#F59E0B] transition-all font-mono"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#F59E0B] hover:bg-amber-400 text-[#0B0D10] font-black py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wide transition-all uppercase cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-[#0B0D10] border-t-transparent rounded-full animate-spin" />
                      <span>GERANDO CÓDIGO OTP...</span>
                    </div>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4 stroke-[2.5]" />
                      <span>SOLICITAR CÓDIGO DE RECUPERAÇÃO</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-[#232833] text-center text-xs text-slate-400">
                Lembrou sua senha?{' '}
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="text-amber-400 font-bold hover:underline"
                >
                  Voltar para o Login
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: STEP 2 - VERIFY OTP & SET NEW PASSWORD */}
          {step === 'verify_and_reset' && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
                    Definir Nova Senha
                  </h2>
                  <button
                    type="button"
                    onClick={() => setStep('request')}
                    className="text-xs text-amber-400 hover:underline font-mono"
                  >
                    Trocar e-mail
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
                  Enviamos o código OTP para <strong className="text-slate-200">{email}</strong>.
                </p>
              </div>

              {/* Instant Dev / Sandbox OTP Display Badge */}
              {generatedOtp && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between text-xs text-amber-300">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>
                      Código OTP Gerado: <strong className="font-mono text-sm text-amber-300 tracking-wider">{generatedOtp}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyOtp}
                    className="px-2.5 py-1 rounded bg-[#161A22] border border-amber-500/40 text-amber-300 hover:text-amber-200 flex items-center gap-1 text-xs cursor-pointer"
                  >
                    {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{isCopied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              )}

              {infoMsg && !generatedOtp && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{infoMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmitReset} className="space-y-4">
                {/* 6-Digit OTP input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-200">
                      Código de Verificação OTP (6 Dígitos)
                    </label>
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Pronto para validar
                    </span>
                  </div>

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
                        className="h-12 w-full text-center text-lg sm:text-xl font-mono font-bold rounded-lg bg-[#1C212C] border border-[#232833] text-amber-400 focus:bg-[#232833] focus:border-[#F59E0B] focus:outline-none transition-all shadow-inner"
                      />
                    ))}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                      <RefreshCw className={`h-3.5 w-3.5 text-amber-400 ${isResending ? 'animate-spin' : ''}`} />
                      <span>
                        Reenviar código em <strong className="text-amber-400 font-bold">{formatTimer(timeLeft)}</strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={timeLeft > 0 || isResending}
                      onClick={handleResendCode}
                      className="text-xs font-mono font-bold text-amber-400 hover:text-amber-300 disabled:opacity-40 disabled:cursor-not-allowed hover:underline transition-colors"
                    >
                      Reenviar Agora
                    </button>
                  </div>
                </div>

                {/* Password fields with Live 8+ Digits & Special Character Checklist */}
                <div className="space-y-3 pt-2 border-t border-[#232833]">
                  <div>
                    <label
                      htmlFor="newPasswordInput"
                      className="block text-xs font-semibold text-slate-200 mb-1"
                    >
                      Nova Senha (Mínimo 8 Dígitos & Símbolos)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        id="newPasswordInput"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Ex: EletricAI#2026@Sec"
                        className="w-full pl-9 pr-10 py-2.5 bg-[#1C212C] border border-[#232833] rounded-lg text-slate-100 text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-[#F59E0B] transition-all font-mono"
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

                  <div>
                    <label
                      htmlFor="confirmPasswordInput"
                      className="block text-xs font-semibold text-slate-200 mb-1"
                    >
                      Confirmar Nova Senha
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        id="confirmPasswordInput"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Repita a nova senha digitada"
                        className="w-full pl-9 pr-10 py-2.5 bg-[#1C212C] border border-[#232833] rounded-lg text-slate-100 text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-[#F59E0B] transition-all font-mono"
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

                  {/* Requirements Checklist (8+ digits, uppercase/lowercase, number, special char) */}
                  <div className="p-3 bg-[#11141A] rounded-lg border border-[#232833] space-y-1.5 font-mono text-xs">
                    <div className="text-slate-400 font-semibold mb-1">Critérios de Complexidade Industrial:</div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {hasMinLength ? <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> : <X className="h-3.5 w-3.5 text-slate-500 shrink-0" />}
                        <span>Mínimo 8 caracteres</span>
                      </div>

                      <div className={`flex items-center gap-1.5 ${hasUpperLower ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {hasUpperLower ? <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> : <X className="h-3.5 w-3.5 text-slate-500 shrink-0" />}
                        <span>Maiúsculas & minúsculas</span>
                      </div>

                      <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {hasNumber ? <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> : <X className="h-3.5 w-3.5 text-slate-500 shrink-0" />}
                        <span>Pelo menos 1 número</span>
                      </div>

                      <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {hasSpecial ? <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> : <X className="h-3.5 w-3.5 text-slate-500 shrink-0" />}
                        <span>Caractere especial (!@#$...)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !isPasswordValid}
                    className="w-full bg-[#F59E0B] hover:bg-amber-400 text-[#0B0D10] font-black py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wide transition-all uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-[#0B0D10] border-t-transparent rounded-full animate-spin" />
                        <span>REDEFININDO SENHA...</span>
                      </div>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 stroke-[2.5]" />
                        <span>CONCLUIR E ATUALIZAR SENHA</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="pt-4 border-t border-[#232833] text-center space-y-2 text-xs text-slate-400">
                <div className="flex items-center justify-center gap-1.5 font-mono">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Ambiente Protegido por Criptografia E2E & RLS Multi-Tenant</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
