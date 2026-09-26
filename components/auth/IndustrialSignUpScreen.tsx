'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/components/shared/WorkspaceContext';
import { supabase } from '@/lib/supabase';
import {
  Zap,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  User,
  Check,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';

interface IndustrialSignUpScreenProps {
  onSwitchToLogin?: () => void;
}

export function IndustrialSignUpScreen({ onSwitchToLogin }: IndustrialSignUpScreenProps) {
  const { loginWithSession, setIsViewingLanding } = useWorkspace();

  // Form states
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [creaNumber, setCreaNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Form validations
    if (!name.trim() || name.trim().length < 3) {
      setErrorMsg('Informe seu nome completo (mínimo de 3 caracteres).');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Informe um endereço de e-mail corporativo válido.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('A senha de acesso deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('A confirmação de senha não confere com a senha digitada.');
      return;
    }

    if (!acceptedTerms) {
      setErrorMsg('É necessário aceitar os termos de uso e conformidade industrial (ABNT/NR-10).');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Call server-side signup route to provision user, tenant & profile in Supabase
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          company_name: companyName.trim() || undefined,
          crea_number: creaNumber.trim() || undefined,
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha ao registrar conta no Supabase.');
      }

      setSuccessMsg('Conta criada com sucesso no PostgreSQL! Autenticando sessão...');

      // 2. Automatically sign in with Supabase Auth to establish live JWT session
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        throw new Error(`Conta criada, mas falhou ao autenticar: ${signInError.message}`);
      }

      if (signInData.session) {
        await loginWithSession(signInData.session);
      }
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Falha na comunicação com o Supabase.';
      setErrorMsg(msg);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#0B0D10] text-slate-100 flex flex-col lg:flex-row overflow-x-hidden font-sans">
      {/* LEFT BRAND PANEL */}
      <div className="relative flex-1 bg-[#0B0D10] flex flex-col justify-between p-8 sm:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-[#232833] overflow-hidden">
        {/* Schematic Grid Background */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="signup-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#232833" strokeWidth="0.8" />
                <circle cx="0" cy="0" r="1.5" fill="#F59E0B" fillOpacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#signup-grid)" />
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
                    NOVO CADASTRO
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono block">
                  Ambiente Industrial em Nuvem Supabase
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

        {/* HERO COPY */}
        <div className="relative z-10 my-8 sm:my-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C212C] border border-[#232833] text-xs font-mono text-slate-300 mb-6">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>PostgreSQL Supabase com Isolamento Multi-Tenant & RLS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 tracking-tight leading-[1.15]">
            Crie sua Organização <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-cyan-400 bg-clip-text text-transparent">
              Engenharia Real com IA
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
            Cadastre sua conta para criar projetos elétricos reais (NBR 5410, NBR 14039, NR-10), automação IEC 61131-3, lógica Ladder e supervisório SCADA com persistência em banco de dados dedicado.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
            <div className="p-3 rounded-lg bg-[#161A22]/90 border border-[#232833] text-xs">
              <span className="text-amber-400 font-bold block mb-1">✓ Sem Dados Fictícios</span>
              <span className="text-slate-400">Todos os projetos, diagramas e tags são gravados diretamente no PostgreSQL.</span>
            </div>
            <div className="p-3 rounded-lg bg-[#161A22]/90 border border-[#232833] text-xs">
              <span className="text-emerald-400 font-bold block mb-1">✓ Isolamento por Tenant</span>
              <span className="text-slate-400">Proteção RLS rigorosa. Nenhuma outra organização acessa seus diagramas.</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="relative z-10 text-xs text-slate-500 font-mono flex items-center gap-4">
          <span>ElétricAi v3.8 Industrial Cloud</span>
          <span>•</span>
          <span>Banco Supabase Live</span>
        </div>
      </div>

      {/* RIGHT SIDE: SIGNUP FORM */}
      <div className="flex-1 bg-[#12161F] flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
              Criar Conta Industrial
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Preencha os dados do engenheiro responsável para provisionar sua organização.
            </p>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-5 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSignUpSubmit} className="space-y-4">
            {/* Field 1: Full Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nome completo do Engenheiro <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Eng. Roberto Silveira"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-[#1C212C] border border-[#232833] rounded-lg text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all font-sans"
                />
              </div>
            </div>

            {/* Field 2: Company / Organization */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nome da Empresa / Planta Industrial
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Building2 className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="Ex: Petroquímica Paulínia S.A."
                  className="w-full pl-9 pr-3 py-2 bg-[#1C212C] border border-[#232833] rounded-lg text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all font-sans"
                />
              </div>
            </div>

            {/* Field 3: CREA (Optional) */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Registro Profissional (CREA / CFT)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <FileCheck2 className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={creaNumber}
                  onChange={e => setCreaNumber(e.target.value)}
                  placeholder="Ex: CREA-SP 50849201/D"
                  className="w-full pl-9 pr-3 py-2 bg-[#1C212C] border border-[#232833] rounded-lg text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all font-mono"
                />
              </div>
            </div>

            {/* Field 4: Professional Email */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                E-mail Profissional <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="roberto@empresa.com.br"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-[#1C212C] border border-[#232833] rounded-lg text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all font-mono"
                />
              </div>
            </div>

            {/* Field 5 & 6: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Senha <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 6 dígitos"
                    required
                    className="w-full pl-9 pr-8 py-2 bg-[#1C212C] border border-[#232833] rounded-lg text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-amber-400"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Confirmar Senha <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-[#1C212C] border border-[#232833] rounded-lg text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none">
                <button
                  type="button"
                  onClick={() => setAcceptedTerms(!acceptedTerms)}
                  className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                    acceptedTerms
                      ? 'bg-amber-500 border-amber-500 text-[#0B0D10]'
                      : 'bg-[#1C212C] border-[#232833]'
                  }`}
                >
                  {acceptedTerms && <Check className="h-3 w-3 stroke-[3]" />}
                </button>
                <span className="leading-snug">
                  Concordo com os Termos de Uso e Políticas de Segurança Industrial (ABNT NBR 5410, NR-10 e IEC 61131-3) com persistência em nuvem.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#F59E0B] hover:bg-amber-400 text-[#0B0D10] font-black py-3 px-4 rounded-lg shadow-[0_0_22px_rgba(245,158,11,0.28)] flex items-center justify-center gap-2 text-sm tracking-wide transition-all transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer uppercase"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-[#0B0D10] border-t-transparent rounded-full animate-spin" />
                    <span>Criando Conta Real no Supabase...</span>
                  </div>
                ) : (
                  <>
                    <span>Criar Conta & Abrir Workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Switch to Login Link */}
          <div className="mt-6 pt-4 border-t border-[#232833] text-center">
            <p className="text-xs text-slate-400">
              Já possui uma conta ativa?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-amber-400 hover:text-amber-300 font-bold hover:underline ml-1 cursor-pointer"
              >
                Entrar no ElétricAi
              </button>
            </p>

            <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Autenticação Real Supabase • Criptografia TLS 1.3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
