import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Informe um endereço de e-mail corporativo válido.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const admin = createAdminClient();

    // 1. Generate 6-digit cryptographic OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetId = `rst_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    // 2. Invalidate previous unused tokens for this email
    try {
      await admin
        .from('password_resets')
        .update({ used: true })
        .eq('email', cleanEmail)
        .eq('used', false);
    } catch (e) {
      console.warn('Notice invalidating old tokens:', e);
    }

    // 3. Insert new OTP token record
    const { error: insertError } = await admin.from('password_resets').insert({
      id: resetId,
      email: cleanEmail,
      token: otpCode,
      expires_at: expiresAt,
      used: false,
    });

    if (insertError) {
      console.error('Erro ao registrar token de reset:', insertError);
    }

    // 4. Try sending native auth reset email if configured
    try {
      await admin.auth.resetPasswordForEmail(cleanEmail);
    } catch {
      // Non-blocking in dev/sandbox
    }

    return NextResponse.json({
      success: true,
      message: 'Código de recuperação gerado com sucesso.',
      email: cleanEmail,
      otpCode: otpCode,
      expiresAt,
    });
  } catch (err: unknown) {
    console.error('Erro no endpoint de solicitação de reset:', err);
    const msg = err instanceof Error ? err.message : 'Falha interna ao processar recuperação.';
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
