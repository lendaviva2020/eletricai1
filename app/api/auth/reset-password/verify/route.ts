import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, token, newPassword } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Endereço de e-mail inválido.' },
        { status: 400 }
      );
    }

    if (!token || typeof token !== 'string' || token.trim().length < 4) {
      return NextResponse.json(
        { success: false, error: 'Informe o código de verificação OTP válido.' },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'A nova senha deve possuir no mínimo 8 caracteres com letras, números e símbolos.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();
    const admin = createAdminClient();

    // 1. Verify token in password_resets table
    const { data: resetRecords, error: queryError } = await admin
      .from('password_resets')
      .select('*')
      .eq('email', cleanEmail)
      .eq('token', cleanToken)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1);

    const validRecord = resetRecords && resetRecords.length > 0 ? resetRecords[0] : null;

    if (!validRecord) {
      // Check if this specific token was already used
      const { data: usedRecords } = await admin
        .from('password_resets')
        .select('*')
        .eq('email', cleanEmail)
        .eq('token', cleanToken)
        .eq('used', true)
        .limit(1);

      if (usedRecords && usedRecords.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Este código OTP já foi utilizado anteriormente. Solicite um novo código.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Código de verificação OTP incorreto ou não encontrado.' },
        { status: 400 }
      );
    }

    // Check expiration if record found
    if (validRecord && validRecord.expires_at) {
      const isExpired = new Date(validRecord.expires_at).getTime() < Date.now();
      if (isExpired) {
        return NextResponse.json(
          { success: false, error: 'Este código OTP expirou. Por favor, solicite um novo código.' },
          { status: 400 }
        );
      }
    }

    // 2. Locate user in Supabase Auth via Admin API
    let authUserId: string | null = null;
    try {
      const { data: usersList, error: listError } = await admin.auth.admin.listUsers();
      if (!listError && usersList && usersList.users) {
        const foundUser = usersList.users.find(u => u.email?.toLowerCase() === cleanEmail);
        if (foundUser) {
          authUserId = foundUser.id;
        }
      }
    } catch (e) {
      console.warn('Could not list users via admin API:', e);
    }

    // 3. Update password in Supabase Auth
    if (authUserId) {
      const { error: updateAuthError } = await admin.auth.admin.updateUserById(authUserId, {
        password: newPassword,
      });

      if (updateAuthError) {
        console.error('Erro ao atualizar senha no Supabase Auth:', updateAuthError);
        return NextResponse.json(
          { success: false, error: `Falha ao alterar senha: ${updateAuthError.message}` },
          { status: 500 }
        );
      }
    } else {
      // User might be a seed profile not yet in auth.users - create them in auth so they can log in
      try {
        await admin.auth.admin.createUser({
          email: cleanEmail,
          password: newPassword,
          email_confirm: true,
          user_metadata: {
            name: `Engenheiro ${cleanEmail.split('@')[0]}`,
          },
        });
      } catch (createErr) {
        console.warn('Notice creating user in auth table during reset:', createErr);
      }
    }

    // 4. Mark token as used
    if (validRecord) {
      await admin
        .from('password_resets')
        .update({ used: true })
        .eq('id', validRecord.id);
    } else {
      await admin
        .from('password_resets')
        .update({ used: true })
        .eq('email', cleanEmail)
        .eq('token', cleanToken);
    }

    return NextResponse.json({
      success: true,
      message: 'Senha redefinida com sucesso. Você já pode efetuar login com sua nova credencial.',
    });
  } catch (err: unknown) {
    console.error('Erro na rota de verificação de reset:', err);
    const msg = err instanceof Error ? err.message : 'Falha interna ao redefinir credencial.';
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
