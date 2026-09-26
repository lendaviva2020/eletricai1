import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, company_name, email, password, crea_number } = body;

    // 1. Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Informe seu nome completo (mínimo 2 caracteres).' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Informe um endereço de e-mail corporativo válido.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'A senha de acesso deve conter no mínimo 6 caracteres.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanCompany = (company_name || `Organização Industrial de ${cleanName}`).trim();
    const cleanCrea = crea_number ? String(crea_number).trim() : null;

    const admin = createAdminClient();

    // 2. Create User in Supabase Auth via Admin API
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: cleanName,
        company_name: cleanCompany,
        crea_number: cleanCrea,
      },
    });

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        return NextResponse.json(
          { success: false, error: 'Este e-mail já está cadastrado no sistema. Faça login.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, error: `Erro no Supabase Auth: ${authError.message}` },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: 'Falha ao provisionar usuário no Supabase.' },
        { status: 500 }
      );
    }

    const userId = authData.user.id;
    const tenantId = `tenant_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

    // 3. Insert Tenant into public.tenants
    const { error: tenantError } = await admin.from('tenants').insert({
      id: tenantId,
      name: cleanCompany,
      cnpj: '00.000.000/0001-00',
      location: 'Brasil',
      plan: 'Industrial Pro Multi-Plant',
      currency: 'BRL',
    });

    if (tenantError) {
      console.error('Erro ao criar tenant:', tenantError);
    }

    // 4. Insert Profile into public.profiles
    const { error: profileError } = await admin.from('profiles').insert({
      id: userId,
      tenant_id: tenantId,
      name: cleanName,
      email: cleanEmail,
      role: 'admin',
      role_title: 'Engenheiro Responsável Técnico',
      crea_number: cleanCrea,
      status: 'ONLINE',
    });

    if (profileError) {
      console.error('Erro ao criar profile:', profileError);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: cleanEmail,
        name: cleanName,
        role: 'admin',
        creaNumber: cleanCrea || 'CREA Ativo',
        tenantId,
      },
      tenant: {
        id: tenantId,
        name: cleanCompany,
        cnpj: '00.000.000/0001-00',
        location: 'Brasil',
      },
    });
  } catch (error: unknown) {
    console.error('Erro no cadastro real de usuário:', error);
    const msg = error instanceof Error ? error.message : 'Falha interna no servidor de autenticação';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
